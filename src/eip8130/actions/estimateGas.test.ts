import { describe, expect, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { toAccount } from '../accounts/toAccount.js'
import { actorScope, canonicalAuthenticators } from '../constants.js'
import { authorizeActor, encodePolicyData, key } from '../keys.js'
import { estimateGas } from './estimateGas.js'

const owner = privateKeyToAccount(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const code = '0x6080604052' as const
const userSalt =
  '0x0000000000000000000000000000000000000000000000000000000000000001' as const

/** A client whose `eth_estimateGas` records the request object and returns a stub gas. */
function recordingClient() {
  let request: any
  const client = createClient({
    chain: mainnet,
    transport: custom({
      async request({ method, params }: { method: string; params: any }) {
        if (method === 'eth_chainId') return '0x1'
        if (method === 'eth_estimateGas') {
          request = params[0]
          return numberToHex(100_000n)
        }
        throw new Error(`unexpected RPC: ${method}`)
      },
    }),
  })
  return {
    client,
    get request() {
      return request
    },
  }
}

describe('estimateGas — create account-change serialization', () => {
  test('each initialActor carries scope (number) and policyData (hex)', async () => {
    const rec = recordingClient()
    const account = toAccount({
      signer: owner,
      userSalt,
      code,
      initialActors: [key.k1(owner.address)],
    })

    await estimateGas(rec.client, {
      sender: account.address,
      accountChanges: [account.create()],
      calls: [[{ to: owner.address, value: 1n }]],
      senderAuthAuthenticator: canonicalAuthenticators.k1,
    })

    const create = rec.request.accountChanges[0]
    expect(create.type).toBe('create')
    const actor = create.initialActors[0]
    // The node deserializes into the consensus `InitialActor` struct, whose
    // `scope` / `policyData` are non-optional (no serde default). Omitting
    // either makes the whole request fail with -32602 invalid params.
    expect(actor).toHaveProperty('scope')
    expect(actor).toHaveProperty('policyData')
    // scope must be a JSON NUMBER (u8), not a quantity hex string.
    expect(typeof actor.scope).toBe('number')
    expect(actor.scope).toBe(0)
    // empty policyData is required, serialized as "0x".
    expect(actor.policyData).toBe('0x')
  })

  test('policy-gated initial actor preserves its scope bits and policyData', async () => {
    const rec = recordingClient()
    const commitment = `0x${'aa'.repeat(32)}` as const
    const policy = {
      type: 1,
      manager: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      commitment,
    } as const
    // Build a policy-gated actor and register it as an initial actor via its
    // scope/policyData (as computeAddress commits them).
    const gated = authorizeActor(
      key.p256({
        x: '0x1111111111111111111111111111111111111111111111111111111111111111',
        y: '0x2222222222222222222222222222222222222222222222222222222222222222',
      }),
      { scope: actorScope.sender, policy },
    )

    const initialActors = [
      {
        actorId: gated.actorId,
        authenticator: gated.authenticator,
        scope: gated.scope,
        policyData: gated.policyData,
      },
      key.k1(owner.address),
    ].sort((a, b) => (BigInt(a.actorId) < BigInt(b.actorId) ? -1 : 1))

    const account = toAccount({
      signer: owner,
      userSalt,
      code,
      initialActors,
    })

    await estimateGas(rec.client, {
      sender: account.address,
      accountChanges: [account.create()],
      calls: [[{ to: owner.address }]],
      senderAuthAuthenticator: canonicalAuthenticators.k1,
    })

    const actors = rec.request.accountChanges[0].initialActors
    const gatedOut = actors.find((a: any) => a.actorId === gated.actorId)
    expect(gatedOut.scope).toBe(actorScope.sender | actorScope.policy)
    expect(typeof gatedOut.scope).toBe('number')
    expect(gatedOut.policyData?.toLowerCase()).toBe(
      encodePolicyData(policy).toLowerCase(),
    )
  })
})

describe('estimateGas — dataSuffix → metadata', () => {
  test('full-body mode writes dataSuffix to metadata', async () => {
    const rec = recordingClient()
    const account = toAccount({
      signer: owner,
      userSalt,
      code,
      initialActors: [key.k1(owner.address)],
    })

    await estimateGas(rec.client, {
      sender: account.address,
      accountChanges: [account.create()],
      calls: [[{ to: owner.address }]],
      senderAuthAuthenticator: canonicalAuthenticators.k1,
      dataSuffix: '0xabcdef',
    })

    expect(rec.request.metadata).toBe('0xabcdef')
  })

  test('full-body mode defaults metadata to 0x', async () => {
    const rec = recordingClient()
    const account = toAccount({
      signer: owner,
      userSalt,
      code,
      initialActors: [key.k1(owner.address)],
    })

    await estimateGas(rec.client, {
      sender: account.address,
      accountChanges: [account.create()],
      calls: [[{ to: owner.address }]],
      senderAuthAuthenticator: canonicalAuthenticators.k1,
    })

    expect(rec.request.metadata).toBe('0x')
  })

  test('accepts a flat calls list and normalizes it into a single phase', async () => {
    const rec = recordingClient()
    const account = toAccount({
      signer: owner,
      userSalt,
      code,
      initialActors: [key.k1(owner.address)],
    })

    // Flat `AaCall[]` — matches the shape `sendTransaction` accepts.
    await estimateGas(rec.client, {
      sender: account.address,
      calls: [
        { to: owner.address, value: 1n },
        { to: owner.address, data: '0x1234' },
      ],
      senderAuthAuthenticator: canonicalAuthenticators.k1,
    })

    // Serialized as a single phase (one inner array) with both calls.
    expect(rec.request.calls).toHaveLength(1)
    expect(rec.request.calls[0]).toHaveLength(2)
    expect(rec.request.calls[0][0]).toMatchObject({
      to: owner.address,
      value: numberToHex(1n),
      data: '0x',
    })
    expect(rec.request.calls[0][1]).toMatchObject({
      to: owner.address,
      value: numberToHex(0n),
      data: '0x1234',
    })
  })

  test('nested phased calls pass through unchanged', async () => {
    const rec = recordingClient()
    const account = toAccount({
      signer: owner,
      userSalt,
      code,
      initialActors: [key.k1(owner.address)],
    })

    await estimateGas(rec.client, {
      sender: account.address,
      calls: [[{ to: owner.address }], [{ to: owner.address, data: '0xab' }]],
      senderAuthAuthenticator: canonicalAuthenticators.k1,
    })

    expect(rec.request.calls).toHaveLength(2)
    expect(rec.request.calls[0]).toHaveLength(1)
    expect(rec.request.calls[1][0]).toMatchObject({ data: '0xab' })
  })
})
