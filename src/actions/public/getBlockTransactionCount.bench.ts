import { bench, describe } from 'vitest'

import { publicClient, web3Provider } from '../../_test'

import { getBlockTransactionCount } from './getBlockTransactionCount'

describe('Get Block Transaction Count', () => {
  bench('viem: `getBlockTransactionCount`', async () => {
    await getBlockTransactionCount(publicClient)
  })

  bench('web3.js: `getBlockTransactionCount`', async () => {
    await web3Provider.eth.getBlockTransactionCount('latest')
  })
})
