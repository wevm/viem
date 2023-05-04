import { publicClient } from '../../_test/utils.js'
import { getFeeHistory } from './getFeeHistory.js'
import { bench, describe } from 'vitest'

describe.skip('Get Fee History', () => {
  bench('viem: `getFeeHistory`', async () => {
    await getFeeHistory(publicClient, {
      blockCount: 2,
      rewardPercentiles: [25, 75],
    })
  })
})
