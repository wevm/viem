import { expect, test } from 'vitest'
import { parseGwei } from '../utils/index.js'
import { BaseError } from './base.js'
import {
  FeeCapTooHighError,
  FeeCapTooLowError,
  InsufficientFundsError,
  IntrinsicGasTooHighError,
  IntrinsicGasTooLowError,
  NonceMaxValueError,
  NonceTooHighError,
  NonceTooLowError,
  TipAboveFeeCapError,
  TransactionTypeNotSupportedError,
  UnknownNodeError,
} from './node.js'

test('FeeCapTooHighError', () => {
  let error = new FeeCapTooHighError({
    cause: new BaseError('foo'),
    maxFeePerGas: parseGwei(
      '420124124012041204024020140124120401281273891237128937128937128737912371283791',
    ),
  })
  expect(error).toMatchInlineSnapshot(`
    [FeeCapTooHigh: The fee cap (\`maxFeePerGas\` = 420124124012041204024020140124120401281273891237128937128937128737912371283791 gwei) cannot be higher than the maximum allowed value (2^256-1).

    Version: viem@1.0.2]
  `)

  error = new FeeCapTooHighError({ cause: new BaseError('foo') })
  expect(error).toMatchInlineSnapshot(`
    [FeeCapTooHigh: The fee cap (\`maxFeePerGas\`) cannot be higher than the maximum allowed value (2^256-1).

    Version: viem@1.0.2]
  `)
})

test('FeeCapTooLowError', () => {
  let error = new FeeCapTooLowError({
    cause: new BaseError('foo'),
    maxFeePerGas: parseGwei('1'),
  })
  expect(error).toMatchInlineSnapshot(`
    [FeeCapTooLow: The fee cap (\`maxFeePerGas\` = 1 gwei) cannot be lower than the block base fee.

    Version: viem@1.0.2]
  `)

  error = new FeeCapTooLowError({ cause: new BaseError('foo') })
  expect(error).toMatchInlineSnapshot(`
    [FeeCapTooLow: The fee cap (\`maxFeePerGas\` gwei) cannot be lower than the block base fee.

    Version: viem@1.0.2]
  `)
})

test('NonceTooHighError', () => {
  let error = new NonceTooHighError({
    cause: new BaseError('foo'),
    nonce: 1,
  })
  expect(error).toMatchInlineSnapshot(`
    [NonceTooHighError: Nonce provided for the transaction (1) is higher than the next one expected.

    Version: viem@1.0.2]
  `)

  error = new NonceTooHighError({ cause: new BaseError('foo') })
  expect(error).toMatchInlineSnapshot(`
    [NonceTooHighError: Nonce provided for the transaction is higher than the next one expected.

    Version: viem@1.0.2]
  `)
})

test('NonceTooLowError', () => {
  let error = new NonceTooLowError({
    cause: new BaseError('foo'),
    nonce: 1,
  })
  expect(error).toMatchInlineSnapshot(`
    [NonceTooLowError: Nonce provided for the transaction (1) is lower than the current nonce of the account.
    Try increasing the nonce or find the latest nonce with \`getTransactionCount\`.

    Version: viem@1.0.2]
  `)

  error = new NonceTooLowError({ cause: new BaseError('foo') })
  expect(error).toMatchInlineSnapshot(`
    [NonceTooLowError: Nonce provided for the transaction is lower than the current nonce of the account.
    Try increasing the nonce or find the latest nonce with \`getTransactionCount\`.

    Version: viem@1.0.2]
  `)
})

test('NonceMaxValueError', () => {
  const error = new NonceMaxValueError({
    cause: new BaseError('foo'),
    nonce: 69420,
  })
  expect(error).toMatchInlineSnapshot(`
    [NonceMaxValueError: Nonce provided for the transaction (69420) exceeds the maximum allowed nonce.

    Version: viem@1.0.2]
  `)
})

test('InsufficientFundsError', () => {
  const error = new InsufficientFundsError({ cause: new BaseError('foo') })
  expect(error).toMatchInlineSnapshot(`
    [InsufficientFundsError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

    This error could arise when the account does not have enough funds to:
     - pay for the total gas fee,
     - pay for the value to send.
     
    The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
     - \`gas\` is the amount of gas needed for transaction to execute,
     - \`gas fee\` is the gas fee,
     - \`value\` is the amount of ether to send to the recipient.

    Version: viem@1.0.2]
  `)
})

test('NonceMaxValueError', () => {
  let error = new NonceMaxValueError({
    cause: new BaseError('foo'),
    nonce: 69420,
  })
  expect(error).toMatchInlineSnapshot(`
    [NonceMaxValueError: Nonce provided for the transaction (69420) exceeds the maximum allowed nonce.

    Version: viem@1.0.2]
  `)

  error = new NonceMaxValueError({ cause: new BaseError('foo') })
  expect(error).toMatchInlineSnapshot(`
    [NonceMaxValueError: Nonce provided for the transaction exceeds the maximum allowed nonce.

    Version: viem@1.0.2]
  `)
})

test('IntrinsicGasTooHighError', () => {
  let error = new IntrinsicGasTooHighError({
    cause: new BaseError('foo'),
    gas: 694242424n,
  })
  expect(error).toMatchInlineSnapshot(`
    [IntrinsicGasTooHighError: The amount of gas (694242424) provided for the transaction exceeds the limit allowed for the block.

    Version: viem@1.0.2]
  `)

  error = new IntrinsicGasTooHighError({ cause: new BaseError('foo') })
  expect(error).toMatchInlineSnapshot(`
    [IntrinsicGasTooHighError: The amount of gas provided for the transaction exceeds the limit allowed for the block.

    Version: viem@1.0.2]
  `)
})

test('IntrinsicGasTooLowError', () => {
  let error = new IntrinsicGasTooLowError({
    cause: new BaseError('foo'),
    gas: 1n,
  })
  expect(error).toMatchInlineSnapshot(`
    [IntrinsicGasTooLowError: The amount of gas (1) provided for the transaction is too low.

    Version: viem@1.0.2]
  `)

  error = new IntrinsicGasTooLowError({ cause: new BaseError('foo') })
  expect(error).toMatchInlineSnapshot(`
    [IntrinsicGasTooLowError: The amount of gas provided for the transaction is too low.

    Version: viem@1.0.2]
  `)
})

test('TransactionTypeNotSupportedError', () => {
  const error = new TransactionTypeNotSupportedError({
    cause: new BaseError('foo'),
  })
  expect(error).toMatchInlineSnapshot(`
    [TransactionTypeNotSupportedError: The transaction type is not supported for this chain.

    Version: viem@1.0.2]
  `)
})

test('TipAboveFeeCapError', () => {
  let error = new TipAboveFeeCapError({
    cause: new BaseError('foo'),
    maxFeePerGas: parseGwei('69'),
    maxPriorityFeePerGas: parseGwei('70'),
  })
  expect(error).toMatchInlineSnapshot(`
    [TipAboveFeeCapError: The provided tip (\`maxPriorityFeePerGas\` = 70 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 69 gwei).

    Version: viem@1.0.2]
  `)

  error = new TipAboveFeeCapError({ cause: new BaseError('foo') })
  expect(error).toMatchInlineSnapshot(`
    [TipAboveFeeCapError: The provided tip (\`maxPriorityFeePerGas\`) cannot be higher than the fee cap (\`maxFeePerGas\`).

    Version: viem@1.0.2]
  `)

  error = new TipAboveFeeCapError({
    cause: new BaseError('foo'),
    maxPriorityFeePerGas: parseGwei('70'),
  })
  expect(error).toMatchInlineSnapshot(`
    [TipAboveFeeCapError: The provided tip (\`maxPriorityFeePerGas\` = 70 gwei) cannot be higher than the fee cap (\`maxFeePerGas\`).

    Version: viem@1.0.2]
  `)

  error = new TipAboveFeeCapError({
    cause: new BaseError('foo'),
    maxFeePerGas: parseGwei('70'),
  })
  expect(error).toMatchInlineSnapshot(`
    [TipAboveFeeCapError: The provided tip (\`maxPriorityFeePerGas\`) cannot be higher than the fee cap (\`maxFeePerGas\` = 70 gwei).

    Version: viem@1.0.2]
  `)
})

test('UnknownNodeError', () => {
  const error = new UnknownNodeError({ cause: new BaseError('foo') })
  expect(error).toMatchInlineSnapshot(`
    [UnknownNodeError: An error occurred while executing: foo

    Version: viem@1.0.2

    Version: viem@1.0.2]
  `)
})
