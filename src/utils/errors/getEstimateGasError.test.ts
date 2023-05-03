import { expect, test } from 'vitest'

import { address } from '../../_test/index.js'
import {
  BaseError,
  RpcRequestError,
  TransactionRejectedRpcError,
} from '../../errors/index.js'
import { parseAccount } from '../index.js'
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

    Version: viem@1.0.2]
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
    Version: viem@1.0.2]
  `)
})
