import { expect, test } from 'vitest'

import { address } from '~test/src/constants.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { BaseError } from '../../errors/base.js'
import { RpcRequestError } from '../../errors/request.js'
import { TransactionRejectedRpcError } from '../../errors/rpc.js'

import { getEstimateGasError } from './getEstimateGasError.js'

test('default', () => {
  const error = new BaseError('Unknown error')
  const result = getEstimateGasError(error, {
    account: parseAccount(address.vitalik),
  })
  expect(result).toMatchInlineSnapshot(`
    [EstimateGasExecutionError: Unknown error

    Estimate Gas Arguments:
      from:  0xd8da6bf26964af9d7eed9e03e53415d37aa96045

    Version: viem@x.y.z]
  `)
})

test('default', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: { code: -32003, message: 'fee cap higher than 2\^256-1' },
      url: '',
    }),
  )
  const result = getEstimateGasError(error, {
    account: parseAccount(address.vitalik),
  })
  expect(result).toMatchInlineSnapshot(`
    [EstimateGasExecutionError: The fee cap (\`maxFeePerGas\`) cannot be higher than the maximum allowed value (2^256-1).

    Estimate Gas Arguments:
      from:  0xd8da6bf26964af9d7eed9e03e53415d37aa96045

    Details: fee cap higher than 2^256-1
    Version: viem@x.y.z]
  `)
})
