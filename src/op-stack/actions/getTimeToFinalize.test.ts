import { beforeAll, describe, expect, test, vi } from 'vitest'
import { anvilMainnet, anvilOptimism } from '~test/anvil.js'
import { getTransactionReceipt, reset } from '../../actions/index.js'

import { base, getWithdrawals, optimism } from '../../op-stack/index.js'
import { getTimeToFinalize } from './getTimeToFinalize.js'

const client = anvilMainnet.getClient()
const optimismClient = anvilOptimism.getClient()

beforeAll(async () => {
  await reset(client, {
    blockNumber: 21890932n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
})

test('default', async () => {
  vi.setSystemTime(new Date(1740108988201))

  const time = await getTimeToFinalize(client, {
    withdrawalHash:
      '0xFF78806A60996A5A656C8ED4174DD3102C388BB9BB157297482C635CDB8F973F',
    targetChain: optimismClient.chain,
  })

  vi.useRealTimers()

  expect(time).toMatchInlineSnapshot(`
    {
      "period": 604800,
      "seconds": 591088,
      "timestamp": 1740700076201,
    }
  `)
})

test('ready to finalize', async () => {
  vi.setSystemTime(new Date(1740108988201 + 591090000))

  const time = await getTimeToFinalize(client, {
    withdrawalHash:
      '0xFF78806A60996A5A656C8ED4174DD3102C388BB9BB157297482C635CDB8F973F',
    targetChain: optimismClient.chain,
  })

  vi.useRealTimers()

  expect(time).toMatchInlineSnapshot(`
    {
      "period": 604800,
      "seconds": 0,
      "timestamp": 1740700078201,
    }
  `)
})

describe('legacy (portal v2)', () => {
  beforeAll(async () => {
    await reset(client, {
      blockNumber: 18770525n,
      jsonRpcUrl: anvilMainnet.forkUrl,
    })
  })

  test('default', async () => {
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0x9a2f4283636ddeb9ac32382961b22c177c9e86dd3b283735c154f897b1a7ff4a',
    })

    const [withdrawal] = getWithdrawals(receipt)

    vi.setSystemTime(new Date(1702399191000))

    const time = await getTimeToFinalize(client, {
      ...withdrawal!,
      targetChain: optimism,
    })

    vi.useRealTimers()

    expect(time).toMatchInlineSnapshot(`
      {
        "period": 604800,
        "seconds": 594810,
        "timestamp": 1702994001000,
      }
    `)
  })

  test('ready to finalize', async () => {
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0x9a2f4283636ddeb9ac32382961b22c177c9e86dd3b283735c154f897b1a7ff4a',
    })

    const [withdrawal] = getWithdrawals(receipt)

    vi.setSystemTime(new Date(1702994990587))

    const time = await getTimeToFinalize(client, {
      ...withdrawal!,
      targetChain: optimism,
    })

    vi.useRealTimers()

    expect(time).toMatchInlineSnapshot(`
      {
        "period": 604800,
        "seconds": 0,
        "timestamp": 1702994990587,
      }
    `)
  })
})

describe('dispute game resolves after the proof matures', () => {
  beforeAll(async () => {
    await reset(client, {
      blockNumber: 26271000n,
      jsonRpcUrl: anvilMainnet.forkUrl,
    })
  })

  test('default', async () => {
    // Base: the proof maturity delay is 1 day, but the proof's dispute game
    // (proven 2026-10-24) only resolves 5 days after it was created.
    vi.setSystemTime(new Date(1792947035000))

    const time = await getTimeToFinalize(client, {
      withdrawalHash:
        '0x15ef63192f15159af29381874e734c448834d21373aeec3f0f348a2d393cdf86',
      targetChain: base,
    })

    vi.useRealTimers()

    expect(time).toMatchInlineSnapshot(`
      {
        "period": 86400,
        "seconds": 317170,
        "timestamp": 1793264205000,
      }
    `)
  })
})
