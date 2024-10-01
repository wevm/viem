import { expect, test } from 'vitest'

import { address } from '~test/src/constants.js'
import { RpcRequestError } from '../../errors/request.js'
import {
  InvalidInputRpcError,
  TransactionRejectedRpcError,
} from '../../errors/rpc.js'
import { parseEther } from '../unit/parseEther.js'
import { parseGwei } from '../unit/parseGwei.js'

import { containsNodeError, getNodeError } from './getNodeError.js'

test('containsNodeError', () => {
  // @ts-expect-error
  expect(containsNodeError(new TransactionRejectedRpcError({}))).toBeTruthy()
  // @ts-expect-error
  expect(containsNodeError(new InvalidInputRpcError({}))).toBeTruthy()
  expect(
    // @ts-expect-error
    containsNodeError(new RpcRequestError({ error: { code: 3 } })),
  ).toBeTruthy()
  // @ts-expect-error
  expect(containsNodeError(new RpcRequestError({ error: {} }))).toBeFalsy()
})

test('FeeCapTooHigh', () => {
  const error = new TransactionRejectedRpcError(
    new RpcRequestError({
      body: {},
      error: { code: -32003, message: 'fee cap higher than 2\^256-1' },
      url: '',
    }),
  )
  const result = getNodeError(error, {
    account: address.vitalik,
    nonce: 1,
    maxFeePerGas: parseGwei(
      '1231287389123781293712897312893791283921738912378912',
    ),
  })
  expect(result).toMatchInlineSnapshot(`
    [FeeCapTooHighError: The fee cap (\`maxFeePerGas\` = 1231287389123781293712897312893791283921738912378912 gwei) cannot be higher than the maximum allowed value (2^256-1).

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
  const result = getNodeError(error, {
    account: address.vitalik,
    nonce: 1,
    maxFeePerGas: parseGwei('1'),
  })
  expect(result).toMatchInlineSnapshot(`
    [FeeCapTooLowError: The fee cap (\`maxFeePerGas\` = 1 gwei) cannot be lower than the block base fee.

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
  const result = getNodeError(error, {
    account: address.vitalik,
    nonce: 1123123213,
  })
  expect(result).toMatchInlineSnapshot(`
    [NonceTooHighError: Nonce provided for the transaction (1123123213) is higher than the next one expected.

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
  const result = getNodeError(error, {
    account: address.vitalik,
    nonce: 1,
  })
  expect(result).toMatchInlineSnapshot(`
    [NonceTooLowError: Nonce provided for the transaction (1) is lower than the current nonce of the account.
    Try increasing the nonce or find the latest nonce with \`getTransactionCount\`.

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
  const result = getNodeError(error, {
    account: address.vitalik,
    nonce: 12222222,
  })
  expect(result).toMatchInlineSnapshot(`
    [NonceMaxValueError: Nonce provided for the transaction (12222222) exceeds the maximum allowed nonce.

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
  const result = getNodeError(error, {
    account: address.vitalik,
    nonce: 1,
    value: parseEther('10'),
  })
  expect(result).toMatchInlineSnapshot(`
    [InsufficientFundsError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

    This error could arise when the account does not have enough funds to:
     - pay for the total gas fee,
     - pay for the value to send.
     
    The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
     - \`gas\` is the amount of gas needed for transaction to execute,
     - \`gas fee\` is the gas fee,
     - \`value\` is the amount of ether to send to the recipient.

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
  const result = getNodeError(error, {
    account: address.vitalik,
    gas: 8912738912731289n,
  })
  expect(result).toMatchInlineSnapshot(`
    [IntrinsicGasTooHighError: The amount of gas (8912738912731289) provided for the transaction exceeds the limit allowed for the block.

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
  const result = getNodeError(error, {
    account: address.vitalik,
    gas: 1n,
  })
  expect(result).toMatchInlineSnapshot(`
    [IntrinsicGasTooLowError: The amount of gas (1) provided for the transaction is too low.

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
  const result = getNodeError(error, {
    account: address.vitalik,
    maxFeePerGas: parseGwei('10'),
  })
  expect(result).toMatchInlineSnapshot(`
    [TransactionTypeNotSupportedError: The transaction type is not supported for this chain.

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
  const result = getNodeError(error, {
    account: address.vitalik,
    maxFeePerGas: parseGwei('10'),
    maxPriorityFeePerGas: parseGwei('11'),
  })
  expect(result).toMatchInlineSnapshot(`
    [TipAboveFeeCapError: The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

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
  const result = getNodeError(error, {
    account: address.vitalik,
    maxFeePerGas: parseGwei('10'),
    maxPriorityFeePerGas: parseGwei('11'),
  })
  expect(result).toMatchInlineSnapshot(`
    [ExecutionRevertedError: Execution reverted with reason: lol oh no.

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
  const result = getNodeError(error, {
    account: address.vitalik,
    maxFeePerGas: parseGwei('10'),
    maxPriorityFeePerGas: parseGwei('11'),
  })
  expect(result).toMatchInlineSnapshot(`
    [ExecutionRevertedError: Execution reverted with reason: lol oh no.

    Details: lol oh no
    Version: viem@x.y.z]
  `)
})

test('UnknownNodeError check with null cause in error chain', () => {
  const error = new TransactionRejectedRpcError(
    new Error('null cause', { cause: null }),
  )
  const result = getNodeError(error, {
    account: address.vitalik,
    maxFeePerGas: parseGwei('10'),
    maxPriorityFeePerGas: parseGwei('11'),
  })
  expect(result).toMatchInlineSnapshot(`
    [UnknownNodeError: An error occurred while executing: Transaction creation failed.

    Details: null cause
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
  const result = getNodeError(error, {
    account: address.vitalik,
  })
  expect(result).toMatchInlineSnapshot(`
    [UnknownNodeError: An error occurred while executing: Transaction creation failed.

    Details: oh no
    Version: viem@x.y.z]
  `)
})
