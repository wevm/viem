import { bench, describe } from 'vitest'

import { publicClient } from '../../_test'

import { getChainId } from './getChainId'

describe.skip('Get Chain ID', () => {
  bench('viem: `getChainId`', async () => {
    await getChainId(publicClient)
  })
})
