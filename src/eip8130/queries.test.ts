import type { Abi } from 'abitype'
import { describe, expect, test } from 'vitest'
import { mainnet } from '../chains/index.js'
import { createClient } from '../clients/createClient.js'
import { custom } from '../clients/transports/custom.js'
import { decodeFunctionData } from '../utils/abi/decodeFunctionData.js'
import { encodeFunctionResult } from '../utils/abi/encodeFunctionResult.js'
import { keystoreAbi } from './abis.js'
import { getActorConfig } from './actions/getActorConfig.js'
import { getPolicy } from './actions/getPolicy.js'
import { getSessionSpend } from './actions/getSessionSpend.js'
import { isActor } from './actions/isActor.js'
import { canonicalAuthenticators } from './constants.js'
import { sessionPolicyAbi } from './policies.js'

const account = '0x0000000000000000000000000000000000000a11'
const actorId = `0x${'11'.repeat(32)}` as const
const token = '0x0000000000000000000000000000000000000a22'
const commitment = `0x${'cc'.repeat(32)}` as const

/**
 * A client whose `eth_call` decodes the requested function and returns the
 * matching pre-encoded result from `results`.
 */
function readClient(abi: Abi, results: Record<string, unknown>) {
  return createClient({
    chain: mainnet,
    transport: custom({
      async request({ method, params }: { method: string; params: any }) {
        if (method === 'eth_chainId') return '0x1'
        if (method === 'eth_call') {
          const { functionName } = decodeFunctionData({
            abi,
            data: params[0].data,
          })
          return encodeFunctionResult({
            abi,
            functionName,
            result: results[functionName] as never,
          })
        }
        throw new Error(`unexpected RPC: ${method}`)
      },
    }),
  })
}

describe('getSessionSpend', () => {
  test('reads getCurrentSpend into a budget view (#43: limit supplied)', async () => {
    const client = readClient(sessionPolicyAbi, {
      // PeriodUsage { start, end, spend }
      getCurrentSpend: { start: 1_000, end: 605_800, spend: 40_000_000n },
    })
    const spend = await getSessionSpend(client, {
      commitment,
      tokenLimit: { token, limit: 100_000_000n, period: 604_800n },
    })
    expect(spend).toEqual({
      allowance: 100_000_000n,
      period: 604_800,
      spent: 40_000_000n,
      remaining: 60_000_000n,
      periodStart: 1_000,
      periodEnd: 605_800,
    })
  })

  test('clamps remaining at zero when overspent', async () => {
    const client = readClient(sessionPolicyAbi, {
      getCurrentSpend: { start: 1_000, end: 605_800, spend: 150_000_000n },
    })
    const spend = await getSessionSpend(client, {
      commitment,
      tokenLimit: { token, limit: 100_000_000n, period: 604_800n },
    })
    expect(spend.remaining).toBe(0n)
  })
})

describe('getActorConfig', () => {
  test('decodes the ActorConfig struct', async () => {
    const client = readClient(keystoreAbi, {
      getActorConfig: {
        authenticator: canonicalAuthenticators.p256,
        scope: 2,
        expiry: 1_800_000_000,
      },
    })
    expect(await getActorConfig(client, { account, actorId })).toEqual({
      authenticator: canonicalAuthenticators.p256,
      scope: 2,
      expiry: 1_800_000_000,
      // SCOPE_POLICY (0x02) is set → hasPolicy.
      hasPolicy: true,
    })
  })
})

describe('isActor', () => {
  // The finalized Keystore has no `isActor` view; liveness is derived from
  // `getActorConfig` (a non-zero authenticator ⇒ bound).
  test('derives liveness from a non-zero authenticator', async () => {
    const client = readClient(keystoreAbi, {
      getActorConfig: {
        authenticator: canonicalAuthenticators.p256,
        scope: 2,
        expiry: 0,
      },
    })
    expect(await isActor(client, { account, actorId })).toBe(true)
  })

  test('returns false for an all-zero (unbound) config', async () => {
    const client = readClient(keystoreAbi, {
      getActorConfig: {
        authenticator: '0x0000000000000000000000000000000000000000',
        scope: 0,
        expiry: 0,
      },
    })
    expect(await isActor(client, { account, actorId })).toBe(false)
  })
})

describe('getPolicy', () => {
  // The finalized Keystore exposes a single combined `getActor` read
  // returning (config, policyManager, policyCommitment).
  test('decodes (manager, commitment) from the combined getActor read', async () => {
    const manager = '0x00000000000000000000000000000000000000dd'
    const client = readClient(keystoreAbi, {
      getActor: [
        {
          authenticator: canonicalAuthenticators.p256,
          scope: 2,
          expiry: 0,
        },
        manager,
        commitment,
      ],
    })
    expect(await getPolicy(client, { account, actorId })).toEqual({
      target: manager,
      commitment,
    })
  })
})
