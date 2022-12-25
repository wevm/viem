import { expect, test } from 'vitest'

import { testClient } from '../../../test'
import { gweiToValue } from '../../utils'

import { setMinGasPrice } from './setMinGasPrice'

test('set next block base fee per gas', async () => {
  await expect(
    setMinGasPrice(testClient, {
      gasPrice: gweiToValue('20'),
    }),
  ).rejects.toMatchInlineSnapshot(`
    [InvalidParamsRpcError: Invalid parameters were provided to the RPC method.
    Double check you have provided the correct parameters.

    Details: anvil_setMinGasPrice is not supported when EIP-1559 is active
    Version: viem@1.0.2]
  `)
})
