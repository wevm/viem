import { bench, describe } from 'vitest'

import { publicClient, web3Provider } from '../../../test'

import { getFeeHistory } from './getFeeHistory'

describe('Get Fee History', () => {
  bench('viem: `getFeeHistory`', async () => {
    await getFeeHistory(publicClient, {
      blockCount: 2,
      rewardPercentiles: [25, 75],
    })
  })

  bench('web3.js: `getFeeHistory`', async () => {
    await web3Provider.eth.getFeeHistory(2, 'latest', [25, 75])
  })
})
