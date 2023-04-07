import { expect, test } from 'vitest'

import { testClient } from '../../_test/index.js'
import { parseGwei } from '../../utils/index.js'

import { setMinGasPrice } from './setMinGasPrice.js'

test.todo('set min gas price')

test('errors when eip-1559 is not enabled', async () => {
  await expect(
    setMinGasPrice(testClient, {
      gasPrice: parseGwei('20'),
    }),
  ).rejects.toMatchInlineSnapshot(`
    [InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
    Double check you have provided the correct parameters.

    URL: http://localhost
    Request body: {"method":"anvil_setMinGasPrice","params":["0x4a817c800"]}

    Details: anvil_setMinGasPrice is not supported when EIP-1559 is active
    Version: viem@1.0.2]
  `)
})
