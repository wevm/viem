import { expect, test } from 'vitest'

import { address } from '~test/src/constants.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { BaseError } from '../../errors/base.js'
import { RpcRequestError } from '../../errors/request.js'
import {
  InvalidInputRpcError,
  TransactionRejectedRpcError,
} from '../../errors/rpc.js'
import { parseEther } from '../unit/parseEther.js'
import { parseGwei } from '../unit/parseGwei.js'

import { getTransactionError } from './getTransactionError.js'

test('default', () => {
  const error = new BaseError('Unknown error')
  const result = getTransactionError(error, {
    account: parseAccount(address.vitalik),
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionExecutionError: Unknown error

    Request Arguments:
      from:  0xd8da6bf26964af9d7eed9e03e53415d37aa96045

    Version: viem@x.y.z]
  `)
})

test('FeeCapTooHigh', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: { code: -32003, message: 'fee cap higher than 2\^256-1' },
      url: '',
    }),
  )
  const result = getTransactionError(error, {
    account: parseAccount(address.vitalik),
    nonce: 1,
    maxFeePerGas: parseGwei(
      '1231287389123781293712897312893791283921738912378912',
    ),
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionExecutionError: The fee cap (\`maxFeePerGas\` = 1231287389123781293712897312893791283921738912378912 gwei) cannot be higher than the maximum allowed value (2^256-1).

    Request Arguments:
      from:          0xd8da6bf26964af9d7eed9e03e53415d37aa96045
      maxFeePerGas:  1231287389123781293712897312893791283921738912378912 gwei
      nonce:         1

    Details: fee cap higher than 2^256-1
    Version: viem@x.y.z]
  `)
})

test('FeeCapTooLow', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: {
        code: -32003,
        message: 'max fee per gas less than block base fee',
      },
      url: '',
    }),
  )
  const result = getTransactionError(error, {
    account: parseAccount(address.vitalik),
    nonce: 1,
    maxFeePerGas: parseGwei('1'),
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionExecutionError: The fee cap (\`maxFeePerGas\` = 1 gwei) cannot be lower than the block base fee.

    Request Arguments:
      from:          0xd8da6bf26964af9d7eed9e03e53415d37aa96045
      maxFeePerGas:  1 gwei
      nonce:         1

    Details: max fee per gas less than block base fee
    Version: viem@x.y.z]
  `)
})

test('NonceTooHigh', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: {
        code: -32003,
        message: 'nonce too high',
      },
      url: '',
    }),
  )
  const result = getTransactionError(error, {
    account: parseAccount(address.vitalik),
    nonce: 1123123213,
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionExecutionError: Nonce provided for the transaction (1123123213) is higher than the next one expected.

    Request Arguments:
      from:   0xd8da6bf26964af9d7eed9e03e53415d37aa96045
      nonce:  1123123213

    Details: nonce too high
    Version: viem@x.y.z]
  `)
})

test('NonceTooLow', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: { code: -32003, message: 'nonce too low' },
      url: '',
    }),
  )
  const result = getTransactionError(error, {
    account: parseAccount(address.vitalik),
    nonce: 1,
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionExecutionError: Nonce provided for the transaction (1) is lower than the current nonce of the account.
    Try increasing the nonce or find the latest nonce with \`getTransactionCount\`.

    Request Arguments:
      from:   0xd8da6bf26964af9d7eed9e03e53415d37aa96045
      nonce:  1

    Details: nonce too low
    Version: viem@x.y.z]
  `)
})

test('NonceMaxValue', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: { code: -32003, message: 'nonce has max value' },
      url: '',
    }),
  )
  const result = getTransactionError(error, {
    account: parseAccount(address.vitalik),
    nonce: 12222222,
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionExecutionError: Nonce provided for the transaction (12222222) exceeds the maximum allowed nonce.

    Request Arguments:
      from:   0xd8da6bf26964af9d7eed9e03e53415d37aa96045
      nonce:  12222222

    Details: nonce has max value
    Version: viem@x.y.z]
  `)
})

test('InsufficientFundsError', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: { code: -32003, message: 'insufficient funds' },
      url: '',
    }),
  )
  const result = getTransactionError(error, {
    account: parseAccount(address.vitalik),
    nonce: 1,
    value: parseEther('10'),
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionExecutionError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

    This error could arise when the account does not have enough funds to:
     - pay for the total gas fee,
     - pay for the value to send.
     
    The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
     - \`gas\` is the amount of gas needed for transaction to execute,
     - \`gas fee\` is the gas fee,
     - \`value\` is the amount of ether to send to the recipient.
     
    Request Arguments:
      from:   0xd8da6bf26964af9d7eed9e03e53415d37aa96045
      value:  10 ETH
      nonce:  1

    Details: insufficient funds
    Version: viem@x.y.z]
  `)
})

test('IntrinsicGasTooHigh', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: { code: -32003, message: 'intrinsic gas too high' },
      url: '',
    }),
  )
  const result = getTransactionError(error, {
    account: parseAccount(address.vitalik),
    gas: 8912738912731289n,
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionExecutionError: The amount of gas (8912738912731289) provided for the transaction exceeds the limit allowed for the block.

    Request Arguments:
      from:  0xd8da6bf26964af9d7eed9e03e53415d37aa96045
      gas:   8912738912731289

    Details: intrinsic gas too high
    Version: viem@x.y.z]
  `)
})

test('IntrinsicGasTooLowError', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: { code: -32003, message: 'intrinsic gas too low' },
      url: '',
    }),
  )
  const result = getTransactionError(error, {
    account: parseAccount(address.vitalik),
    gas: 1n,
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionExecutionError: The amount of gas (1) provided for the transaction is too low.

    Request Arguments:
      from:  0xd8da6bf26964af9d7eed9e03e53415d37aa96045
      gas:   1

    Details: intrinsic gas too low
    Version: viem@x.y.z]
  `)
})

test('TransactionTypeNotSupported', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: { code: -32003, message: 'transaction type not valid' },
      url: '',
    }),
  )
  const result = getTransactionError(error, {
    account: parseAccount(address.vitalik),
    maxFeePerGas: parseGwei('10'),
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionExecutionError: The transaction type is not supported for this chain.

    Request Arguments:
      from:          0xd8da6bf26964af9d7eed9e03e53415d37aa96045
      maxFeePerGas:  10 gwei

    Details: transaction type not valid
    Version: viem@x.y.z]
  `)
})

test('TipAboveFeeCap', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: {
        code: -32003,
        message: 'max priority fee per gas higher than max fee per gas',
      },
      url: '',
    }),
  )
  const result = getTransactionError(error, {
    account: parseAccount(address.vitalik),
    maxFeePerGas: parseGwei('10'),
    maxPriorityFeePerGas: parseGwei('11'),
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionExecutionError: The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

    Request Arguments:
      from:                  0xd8da6bf26964af9d7eed9e03e53415d37aa96045
      maxFeePerGas:          10 gwei
      maxPriorityFeePerGas:  11 gwei

    Details: max priority fee per gas higher than max fee per gas
    Version: viem@x.y.z]
  `)
})

test('ExecutionRevertedError', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: {
        code: -32003,
        message: 'execution reverted: lol oh no',
      },
      url: '',
    }),
  )
  const result = getTransactionError(error, {
    account: parseAccount(address.vitalik),
    maxFeePerGas: parseGwei('10'),
    maxPriorityFeePerGas: parseGwei('11'),
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionExecutionError: Execution reverted with reason: lol oh no.

    Request Arguments:
      from:                  0xd8da6bf26964af9d7eed9e03e53415d37aa96045
      maxFeePerGas:          10 gwei
      maxPriorityFeePerGas:  11 gwei

    Details: execution reverted: lol oh no
    Version: viem@x.y.z]
  `)
})

test('ExecutionRevertedError', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: {
        code: 3,
        message: 'lol oh no',
      },
      url: '',
    }),
  )
  const result = getTransactionError(error, {
    account: parseAccount(address.vitalik),
    maxFeePerGas: parseGwei('10'),
    maxPriorityFeePerGas: parseGwei('11'),
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionExecutionError: Execution reverted with reason: lol oh no.

    Request Arguments:
      from:                  0xd8da6bf26964af9d7eed9e03e53415d37aa96045
      maxFeePerGas:          10 gwei
      maxPriorityFeePerGas:  11 gwei

    Details: lol oh no
    Version: viem@x.y.z]
  `)
})

test('Unknown node error', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: { code: -32003, message: 'oh no' },
      url: '',
    }),
  )
  const result = getTransactionError(error, {
    account: parseAccount(address.vitalik),
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionExecutionError: Transaction creation failed.

    URL: http://localhost
    Request body: {}
     
    Request Arguments:
      from:  0xd8da6bf26964af9d7eed9e03e53415d37aa96045

    Details: oh no
    Version: viem@x.y.z]
  `)

  const error2 = new InvalidInputRpcError(
    new RpcRequestError({
      body: {},
      error: { code: -32000, message: 'oh no' },
      url: '',
    }),
  )
  const result2 = getTransactionError(error2, {
    account: parseAccount(address.vitalik),
  })
  expect(result2).toMatchInlineSnapshot(`
    [TransactionExecutionError: Missing or invalid parameters.
    Double check you have provided the correct parameters.

    URL: http://localhost
    Request body: {}
     
    Request Arguments:
      from:  0xd8da6bf26964af9d7eed9e03e53415d37aa96045

    Details: oh no
    Version: viem@x.y.z]
  `)
})
