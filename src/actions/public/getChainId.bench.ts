import { bench, describe } from 'vitest'

import { publicClient } from '../../_test/index.js'

import { getChainId } from './getChainId.js'

describe.skip('Get Chain ID', () => {
  bench('viem: `getChainId`', async () => {
    await getChainId(publicClient)
  })
})
