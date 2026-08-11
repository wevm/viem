import { describe, expect, test } from 'vitest'
import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import { mainnet } from '../chains/index.js'
import { createClient } from '../clients/createClient.js'
import { custom } from '../clients/transports/custom.js'
import type { Hex } from '../types/misc.js'
import { keccak256 } from '../utils/hash/keccak256.js'
import {
  delegateAuthSize,
  newSmartAccount,
  toAccount,
  toDelegateSigner,
} from './accounts/toAccount.js'
import { sendCalls } from './actions/sendCalls.js'
import {
  actorScope,
  canonicalAuthenticators,
  ecrecoverAuthenticator,
} from './constants.js'
import { canonicalEip8130Deployment } from './deployments.js'
import {
  authorizeActor,
  encodePolicyData,
  key,
  revokeActor,
  toScope,
} from './keys.js'
import { actorIdFromAddress, actorIdFromPublicKey } from './utils/actorId.js'
import { parseTransaction } from './utils/parseTransaction.js'
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

describe('canonical smart-account deployment', () => {
  test('defaults to an ERC-1167 proxy to DefaultAccount', () => {
    const account = newSmartAccount({ signer: owner, salt: userSalt })

    expect(account.createChange.code).toBe(
      erc1167Bytecode(canonicalEip8130Deployment.accounts.default),
    )
  })

  test('requires an explicit implementation for upgradeable accounts', () => {
    expect(() =>
      newSmartAccount({
        signer: owner,
        salt: userSalt,
        upgradeable: true,
      }),
    ).toThrow('`implementation` is required for `upgradeable: true`')
  })
})

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

describe('toAccount', () => {
  const account = toAccount({
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
    expect(change.changes).toHaveLength(2)
    // signature = ecrecover authenticator (20 bytes) || 65-byte sig = 85 bytes
    expect(change.signature.length).toBe(2 + 85 * 2)
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

describe('sendCalls', () => {
  let sent: Hex | undefined
  const client = createClient({
    chain: mainnet,
    transport: custom({
      async request({ method, params }: { method: string; params: any }) {
        if (method === 'eth_chainId') return '0x1'
        // Offline: actor is not yet bound — `getActorConfig` returns an all-zero
        // 3-word ActorConfig struct (authenticator 0x0), so `resolveSigningScope`
        // falls back to the declared handle scope.
        if (method === 'eth_call') return `0x${'0'.repeat(192)}`
        if (method === 'eth_sendRawTransaction') {
          sent = params[0]
          return keccak256(params[0])
        }
        throw new Error(`unexpected RPC: ${method}`)
      },
    }),
  })
  const account = toAccount({
    signer: owner,
    userSalt,
    code,
    initialActors: [key.k1(owner.address)],
  })

  test('builds, signs, serializes and submits an AA_TX_TYPE tx', async () => {
    const hash = await sendCalls(client, {
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

    const parsed = parseTransaction(sent!)
    expect(parsed.from?.toLowerCase()).toBe(account.address.toLowerCase())
    expect(parsed.chainId).toBe(1)
    expect(parsed.calls).toHaveLength(1) // single atomic phase
    expect(parsed.calls?.[0]).toHaveLength(2)
    expect(parsed.accountChanges?.[0]?.type).toBe('create')
    expect(parsed.senderAuth).toBeDefined()
    expect(parsed.metadata).toBeUndefined()
  })

  test('behavior: dataSuffix is written to metadata', async () => {
    await sendCalls(client, {
      account,
      calls: [{ to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', data: '0x' }],
      accountChanges: [account.create()],
      gas: 200_000n,
      maxFeePerGas: 2_000_000_000n,
      maxPriorityFeePerGas: 1_000_000_000n,
      nonceSequence: 0n,
      dataSuffix: '0xdeadbeef',
    })

    const parsed = parseTransaction(sent!)
    expect(parsed.metadata).toBe('0xdeadbeef')
    // Calldata is untouched — attribution lives in metadata, not call data.
    expect(parsed.calls?.[0]?.[0]?.data ?? '0x').toBe('0x')
  })

  test('behavior: client.dataSuffix populates metadata', async () => {
    let clientSent: Hex | undefined
    const suffixedClient = createClient({
      chain: mainnet,
      dataSuffix: '0x12345678',
      transport: custom({
        async request({ method, params }: { method: string; params: any }) {
          if (method === 'eth_chainId') return '0x1'
          if (method === 'eth_call') return `0x${'0'.repeat(192)}`
          if (method === 'eth_sendRawTransaction') {
            clientSent = params[0]
            return keccak256(params[0])
          }
          throw new Error(`unexpected RPC: ${method}`)
        },
      }),
    })

    await sendCalls(suffixedClient, {
      account,
      calls: [{ to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', data: '0x' }],
      accountChanges: [account.create()],
      gas: 200_000n,
      maxFeePerGas: 2_000_000_000n,
      maxPriorityFeePerGas: 1_000_000_000n,
      nonceSequence: 0n,
    })

    expect(parseTransaction(clientSent!).metadata).toBe('0x12345678')
  })
})

describe('toDelegateSigner (sub-account via key.delegate)', () => {
  const parent = '0x00112233445566778899aabbccddeeff00112233' as const

  test('delegateAuthSize defaults to a 125-byte K1 blob', () => {
    expect(delegateAuthSize()).toBe(125)
    expect(delegateAuthSize(128)).toBe(188)
  })

  test('signer wraps the nested sig into the delegate data blob', async () => {
    const signer = toDelegateSigner({
      delegateAccount: parent,
      nestedSigner: owner,
    })
    expect(signer.authenticator).toBe(canonicalAuthenticators.delegate)
    const hash = keccak256('0xdeadbeef')
    const blob = await signer.sign!({ hash })
    // data = delegate(20) || nestedAuthenticator(20) || nestedSig(65) = 105 bytes
    expect((blob.length - 2) / 2).toBe(105)
    expect(blob.slice(0, 42).toLowerCase()).toBe(parent.toLowerCase())
    expect(blob.slice(42, 82).toLowerCase()).toBe(
      ecrecoverAuthenticator.slice(2).toLowerCase(),
    )
  })

  test('toAccount serializes the full delegate senderAuth', async () => {
    const signer = toDelegateSigner({
      delegateAccount: parent,
      nestedSigner: owner,
    })
    const sub = toAccount({
      signer,
      authenticator: signer.authenticator,
      userSalt,
      code,
      initialActors: [key.delegate(parent)],
    })
    const serialized = await sub.signTransaction({
      chainId: 1,
      calls: [[{ to: parent, data: '0x' }]],
      accountChanges: [sub.create()],
      gas: 200_000n,
      maxFeePerGas: 2_000_000_000n,
      maxPriorityFeePerGas: 1_000_000_000n,
      nonceSequence: 0n,
    })
    const parsed = parseTransaction(serialized)
    // senderAuth = DELEGATE(20) || delegate(20) || nested(20) || sig(65) = 125 bytes
    expect((parsed.senderAuth!.length - 2) / 2).toBe(delegateAuthSize())
    expect(parsed.senderAuth!.slice(0, 42).toLowerCase()).toBe(
      canonicalAuthenticators.delegate.toLowerCase(),
    )
  })
})
