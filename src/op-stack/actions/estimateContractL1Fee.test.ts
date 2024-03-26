import { expect, test } from 'vitest'
import { usdcContractConfig } from '~test/src/abis.js'
import { optimismClient } from '~test/src/opStack.js'

import { estimateContractL1Fee } from './estimateContractL1Fee.js'

test('default', async () => {
  expect(
    await estimateContractL1Fee(optimismClient, {
      ...usdcContractConfig,
      address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      account: '0xc8373edfad6d5c5f600b6b2507f78431c5271ff5',
      functionName: 'transfer',
      args: ['0xc8373edfad6d5c5f600b6b2507f78431c5271ff5', 1n],
    }),
  ).toBeDefined()
})

test('revert', async () => {
  await expect(() =>
    estimateContractL1Fee(optimismClient, {
      ...usdcContractConfig,
      address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      functionName: 'transfer',
      args: ['0xc8373edfad6d5c5f600b6b2507f78431c5271ff5', 1n],
    }),
  ).rejects.toMatchInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "transfer" reverted with the following reason:
    ERC20: transfer amount exceeds balance

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  transfer(address recipient, uint256 amount)
      args:              (0xc8373edfad6d5c5f600b6b2507f78431c5271ff5, 1)
      sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC

    Docs: https://viem.sh/docs/chains/op-stack/estimateContractL1Fee
    Version: viem@1.0.2]
  `)
})
