import { bench, describe } from 'vitest'

import { publicClient } from '../../../test'

import { getFeeHistory } from './getFeeHistory'

describe('Get Fee History', () => {
  bench('viem: `getFeeHistory`', async () => {
    await getFeeHistory(publicClient, {
      blockCount: 2,
      rewardPercentiles: [25, 75],
    })
  })
})
