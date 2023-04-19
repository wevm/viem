import { bench, describe } from 'vitest'

import { publicClient, setupAnvil } from '../../_test/index.js'

import { getFeeHistory } from './getFeeHistory.js'

setupAnvil()

describe.skip('Get Fee History', () => {
  bench('viem: `getFeeHistory`', async () => {
    await getFeeHistory(publicClient, {
      blockCount: 2,
      rewardPercentiles: [25, 75],
    })
  })
})
