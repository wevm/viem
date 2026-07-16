import { describe, expect, test } from 'vitest'
import type { Abi } from 'abitype'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { decodeFunctionData } from '../../utils/abi/decodeFunctionData.js'
import { encodeFunctionResult } from '../../utils/abi/encodeFunctionResult.js'
import { accountConfigurationAbi } from './abis.js'
import { getActorConfig8130 } from './actions/getActorConfig8130.js'
import { getPolicy8130 } from './actions/getPolicy8130.js'
import { getSessionSpend8130 } from './actions/getSessionSpend8130.js'
import { isActor8130 } from './actions/isActor8130.js'
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

describe('getSessionSpend8130', () => {
  test('combines getTokenLimit + getCurrentSpend into a budget view', async () => {
    const client = readClient(sessionPolicyAbi, {
      // set, allowance, period
      getTokenLimit: [true, 100_000_000n, 604_800],
      // PeriodUsage { start, end, spend }
      getCurrentSpend: { start: 1_000, end: 605_800, spend: 40_000_000n },
    })
    const spend = await getSessionSpend8130(client, { commitment, token })
    expect(spend).toEqual({
      set: true,
      allowance: 100_000_000n,
      period: 604_800,
      spent: 40_000_000n,
      remaining: 60_000_000n,
      periodStart: 1_000,
      periodEnd: 605_800,
    })
  })

  test('clamps remaining at zero when overspent/unset', async () => {
    const client = readClient(sessionPolicyAbi, {
      getTokenLimit: [false, 0n, 0],
      getCurrentSpend: { start: 0, end: 0, spend: 0n },
    })
    const spend = await getSessionSpend8130(client, { commitment, token })
    expect(spend.set).toBe(false)
    expect(spend.remaining).toBe(0n)
  })
})

describe('getActorConfig8130', () => {
  test('decodes the ActorConfig struct', async () => {
    const client = readClient(accountConfigurationAbi, {
      getActorConfig: {
        authenticator: canonicalAuthenticators.p256,
        scope: 2,
        expiry: 1_800_000_000,
      },
    })
    expect(await getActorConfig8130(client, { account, actorId })).toEqual({
      authenticator: canonicalAuthenticators.p256,
      scope: 2,
      expiry: 1_800_000_000,
      // SCOPE_POLICY (0x02) is set → hasPolicy.
      hasPolicy: true,
    })
  })
})

describe('isActor8130', () => {
  test('decodes the isActor bool', async () => {
    const client = readClient(accountConfigurationAbi, { isActor: true })
    expect(await isActor8130(client, { account, actorId })).toBe(true)
  })
})

describe('getPolicy8130', () => {
  test('decodes (target, commitment)', async () => {
    const manager = '0x00000000000000000000000000000000000000dd'
    const client = readClient(accountConfigurationAbi, {
      getPolicy: [manager, commitment],
    })
    expect(await getPolicy8130(client, { account, actorId })).toEqual({
      target: manager,
      commitment,
    })
  })
})
