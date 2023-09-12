import { bench, describe } from 'vitest'

import { publicClient } from '~test/src/utils.js'

import { getFeeHistory } from './getFeeHistory.js'

describe.skip('Get Fee History', () => {
  bench('viem: `getFeeHistory`', async () => {
    await getFeeHistory(publicClient, {
      blockCount: 2,
      rewardPercentiles: [25, 75],
    })
  })
})
