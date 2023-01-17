import { bench, describe } from 'vitest'

import { publicClient, web3Provider } from '../../../test'

import { getChainId } from './getChainId'

describe('Get Chain ID', () => {
  bench('viem: `getChainId`', async () => {
    await getChainId(publicClient)
  })

  bench('web3.js: `getChainId`', async () => {
    await web3Provider.eth.getChainId()
  })
})
