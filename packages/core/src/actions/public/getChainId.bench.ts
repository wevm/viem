import { bench, describe } from 'vitest'

import { publicClient } from '../../../test'

import { getChainId } from './getChainId'

describe('Get Chain ID', () => {
  bench('viem: `getChainId`', async () => {
    await getChainId(publicClient)
  })
})
