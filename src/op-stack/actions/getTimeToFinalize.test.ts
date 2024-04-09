import { beforeAll, describe, expect, test, vi } from 'vitest'
import {
  optimismClient,
  optimismSepoliaClient,
} from '../../../test/src/opStack.js'
import {
  publicClient,
  sepoliaClient,
  setBlockNumber,
} from '../../../test/src/utils.js'
import { getTransactionReceipt } from '../../actions/index.js'
import { getWithdrawals, optimism } from '../../op-stack/index.js'
import { getTimeToFinalize } from './getTimeToFinalize.js'

// TODO(fault-proofs): use `publicClient` when fault proofs deployed to mainnet.
test('default', async () => {
  const receipt = await getTransactionReceipt(optimismSepoliaClient, {
    hash: '0x0cb90819569b229748c16caa26c9991fb8674581824d31dc9339228bb4e77731',
  })

  const [withdrawal] = getWithdrawals(receipt)

  vi.setSystemTime(new Date(1711008145099))

  const time = await getTimeToFinalize(sepoliaClient, {
    ...withdrawal!,
    targetChain: optimismSepoliaClient.chain,
  })

  vi.useRealTimers()

  expect(time).toMatchInlineSnapshot(`
    {
      "period": 604800,
      "seconds": 583844,
      "timestamp": 1711591989099,
    }
  `)
})

// TODO(fault-proofs): use `publicClient` when fault proofs deployed to mainnet.
test('ready to finalize', async () => {
  const receipt = await getTransactionReceipt(optimismSepoliaClient, {
    hash: '0x0cb90819569b229748c16caa26c9991fb8674581824d31dc9339228bb4e77731',
  })

  const [withdrawal] = getWithdrawals(receipt)

  vi.setSystemTime(new Date(1711591989099))

  const time = await getTimeToFinalize(sepoliaClient, {
    ...withdrawal!,
    targetChain: optimismSepoliaClient.chain,
  })

  vi.useRealTimers()

  expect(time).toMatchInlineSnapshot(`
    {
      "period": 604800,
      "seconds": 0,
      "timestamp": 1711591989099,
    }
  `)
})

describe('legacy (portal v2)', () => {
  beforeAll(async () => {
    await setBlockNumber(18770525n)
  })

  test('default', async () => {
    const receipt = await getTransactionReceipt(optimismClient, {
      hash: '0x9a2f4283636ddeb9ac32382961b22c177c9e86dd3b283735c154f897b1a7ff4a',
    })

    const [withdrawal] = getWithdrawals(receipt)

    vi.setSystemTime(new Date(1702399191000))

    const time = await getTimeToFinalize(publicClient, {
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

    const time = await getTimeToFinalize(publicClient, {
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
