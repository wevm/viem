import { expect, test } from 'vitest'

import { testClient } from '../../_test'
import { parseGwei } from '../../utils'

import { setMinGasPrice } from './setMinGasPrice'

test.todo('set min gas price')

test('errors when eip-1559 is not enabled', async () => {
  await expect(
    setMinGasPrice(testClient, {
      gasPrice: parseGwei('20'),
    }),
  ).rejects.toMatchInlineSnapshot(`
    [InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
    Double check you have provided the correct parameters.

    Details: anvil_setMinGasPrice is not supported when EIP-1559 is active
    Version: viem@1.0.2]
  `)
})
