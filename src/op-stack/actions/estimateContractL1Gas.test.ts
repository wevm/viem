import { expect, test } from 'vitest'
import { usdcContractConfig } from '~test/abis.js'

import { anvilOptimism } from '~test/anvil.js'
import { estimateContractL1Gas } from './estimateContractL1Gas.js'

const optimismClient = anvilOptimism.getClient()

test('default', async () => {
  expect(
    await estimateContractL1Gas(optimismClient, {
      ...usdcContractConfig,
      address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      account: '0xc8373edfad6d5c5f600b6b2507f78431c5271ff5',
      functionName: 'transfer',
      args: ['0xc8373edfad6d5c5f600b6b2507f78431c5271ff5', 1n],
    }),
  ).toBe(1600n)
})
