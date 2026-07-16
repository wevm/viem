import { describe, expect, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import type { Hex } from '../../types/misc.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import { to8130Account } from './accounts/to8130Account.js'
import { sendCalls8130 } from './actions/sendCalls.js'
import { actorScope, canonicalAuthenticators } from './constants.js'
import {
  authorizeActor,
  encodePolicyData,
  key,
  revokeActor,
  toScope,
} from './keys.js'
import { actorIdFromAddress, actorIdFromPublicKey } from './utils/actorId.js'
import { parseTransaction8130 } from './utils/parseTransaction.js'
import { erc1167Bytecode } from './utils/proxy.js'

const owner = privateKeyToAccount(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const code = erc1167Bytecode('0x00000000000000000000000000000000000000Ec')
const userSalt =
  '0x0000000000000000000000000000000000000000000000000000000000000001'

const pubkey = {
  x: '0x1111111111111111111111111111111111111111111111111111111111111111',
  y: '0x2222222222222222222222222222222222222222222222222222222222222222',
} as const

describe('key builders + actorId derivation', () => {
  test('k1 actor', () => {
    expect(key.k1(owner.address)).toEqual({
      actorId: actorIdFromAddress(owner.address),
      authenticator: canonicalAuthenticators.k1,
    })
  })

  test('p256 actor derives actorId = keccak256(x || y)', () => {
    const actor = key.p256(pubkey)
    expect(actor.authenticator).toBe(canonicalAuthenticators.p256)
    expect(actor.actorId).toBe(actorIdFromPublicKey(pubkey))
    expect(actor.actorId).toBe(keccak256(`${pubkey.x}${pubkey.y.slice(2)}`))
  })
})

describe('scope + policy helpers', () => {
  test('toScope combines flags', () => {
    expect(toScope(actorScope.sender, actorScope.selfPayer)).toBe(0x09)
  })

  test('encodePolicyData = manager || commitment', () => {
    const manager = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    const commitment =
      '0x00000000000000000000000000000000000000000000000000000000000000aa'
    const data = encodePolicyData({ type: 1, manager, commitment })
    expect(data.toLowerCase()).toBe(
      `${manager.toLowerCase()}${commitment.slice(2)}`,
    )
  })

  test('authorizeActor rejects unrestricted (admin) policy actor; sets SCOPE_POLICY bit otherwise', () => {
    const commitment = `0x${'aa'.repeat(32)}` as const
    const policy = {
      type: 1,
      manager: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      commitment,
    } as const
    // A policy-bearing actor must have a restricted (non-admin) scope.
    expect(() => authorizeActor(key.p256(pubkey), { policy })).toThrow()
    expect(() =>
      authorizeActor(key.p256(pubkey), { scope: 0, policy }),
    ).toThrow()
    // sender-scoped policy actor: SCOPE_POLICY bit is set, policyData populated.
    const change = authorizeActor(key.p256(pubkey), {
      scope: actorScope.sender,
      policy,
    })
    expect(change.scope).toBe(actorScope.sender | actorScope.policy)
    expect(change.policyData?.toLowerCase()).toBe(
      `${policy.manager.toLowerCase()}${commitment.slice(2)}`,
    )
  })
})

describe('to8130Account', () => {
  const account = to8130Account({
    signer: owner,
    userSalt,
    code,
    initialActors: [key.k1(owner.address)],
  })

  test('create() entry', () => {
    expect(account.create()).toEqual({
      type: 'create',
      userSalt,
      code,
      initialActors: [key.k1(owner.address)],
    })
  })

  test('change() produces a signed config entry (add p256 session key)', async () => {
    const change = await account.change([
      authorizeActor(key.p256(pubkey), {
        scope: actorScope.sender,
        policy: {
          type: 1,
          manager: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          commitment: `0x${'aa'.repeat(32)}`,
        },
      }),
      revokeActor(key.k1('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC')),
    ])
    expect(change.type).toBe('config')
    expect(change.actorChanges).toHaveLength(2)
    // auth = ecrecover authenticator (20 bytes) || 65-byte sig = 85 bytes
    expect(change.auth.length).toBe(2 + 85 * 2)
  })

  test('delegate() entry', () => {
    expect(
      account.delegate('0x0000000000000000000000000000000000000000'),
    ).toEqual({
      type: 'delegation',
      target: '0x0000000000000000000000000000000000000000',
    })
  })
})

describe('sendCalls8130', () => {
  let sent: Hex | undefined
  const client = createClient({
    chain: mainnet,
    transport: custom({
      async request({ method, params }: { method: string; params: any }) {
        if (method === 'eth_chainId') return '0x1'
        if (method === 'eth_sendRawTransaction') {
          sent = params[0]
          return keccak256(params[0])
        }
        throw new Error(`unexpected RPC: ${method}`)
      },
    }),
  })
  const account = to8130Account({
    signer: owner,
    userSalt,
    code,
    initialActors: [key.k1(owner.address)],
  })

  test('builds, signs, serializes and submits an AA_TX_TYPE tx', async () => {
    const hash = await sendCalls8130(client, {
      account,
      calls: [
        { to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', data: '0x' },
        {
          to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
          data: '0xdeadbeef',
        },
      ],
      accountChanges: [account.create()],
      // explicit values to keep the test offline
      gas: 200_000n,
      maxFeePerGas: 2_000_000_000n,
      maxPriorityFeePerGas: 1_000_000_000n,
      nonceSequence: 0n,
    })
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/)
    expect(sent?.startsWith('0x79')).toBe(true)

    const parsed = parseTransaction8130(sent!)
    expect(parsed.from?.toLowerCase()).toBe(account.address.toLowerCase())
    expect(parsed.chainId).toBe(1)
    expect(parsed.calls).toHaveLength(1) // single atomic phase
    expect(parsed.calls?.[0]).toHaveLength(2)
    expect(parsed.accountChanges?.[0]?.type).toBe('create')
    expect(parsed.senderAuth).toBeDefined()
  })
})
