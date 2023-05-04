import { publicClient } from '../../_test/utils.js'
import { getChainId } from './getChainId.js'
import { bench, describe } from 'vitest'

describe.skip('Get Chain ID', () => {
  bench('viem: `getChainId`', async () => {
    await getChainId(publicClient)
  })
})
