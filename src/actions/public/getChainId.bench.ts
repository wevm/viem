import { bench, describe } from 'vitest'

import { publicClient, setupAnvil } from '../../_test/index.js'

import { getChainId } from './getChainId.js'

setupAnvil()

describe.skip('Get Chain ID', () => {
  bench('viem: `getChainId`', async () => {
    await getChainId(publicClient)
  })
})
