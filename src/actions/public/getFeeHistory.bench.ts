import { bench, describe } from 'vitest'

import { publicClient } from '../../_test/index.js'

import { getFeeHistory } from './getFeeHistory.js'

describe.skip('Get Fee History', () => {
  bench('viem: `getFeeHistory`', async () => {
    await getFeeHistory(publicClient, {
      blockCount: 2,
      rewardPercentiles: [25, 75],
    })
  })
})
