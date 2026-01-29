import { describe, expect, test } from 'vitest'

import { address } from '~test/src/constants.js'
import { parseAccount } from '../accounts/utils/parseAccount.js'
import { polygon } from '../chains/index.js'

import { BaseError } from './base.js'
import {
  FeeConflictError,
  InvalidLegacyVError,
  InvalidSerializableTransactionError,
  InvalidSerializedTransactionError,
  InvalidSerializedTransactionTypeError,
  TransactionExecutionError,
  TransactionNotFoundError,
  TransactionReceiptNotFoundError,
  WaitForTransactionReceiptTimeoutError,
} from './transaction.js'

test('InvalidLegacyVError', () => {
  expect(new InvalidLegacyVError({ v: 69n })).toMatchInlineSnapshot(`
    [InvalidLegacyVError: Invalid \`v\` value "69". Expected 27 or 28.

    Version: viem@x.y.z]
  `)
})

test('InvalidSerializableTransactionError', () => {
  expect(
    new InvalidSerializableTransactionError({
      transaction: {
        chainId: 1,
        to: '0x0000000000000000000000000000000000000000',
      },
    }),
  ).toMatchInlineSnapshot(`
    [InvalidSerializableTransactionError: Cannot infer a transaction type from provided transaction.

    Provided Transaction:
    {
      chainId:  1
      to:       0x0000000000000000000000000000000000000000
    }

    To infer the type, either provide:
    - a \`type\` to the Transaction, or
    - an EIP-1559 Transaction with \`maxFeePerGas\`, or
    - an EIP-2930 Transaction with \`gasPrice\` & \`accessList\`, or
    - an EIP-4844 Transaction with \`blobs\`, \`blobVersionedHashes\`, \`sidecars\`, or
    - an EIP-7702 Transaction with \`authorizationList\`, or
    - a Legacy Transaction with \`gasPrice\`

    Version: viem@x.y.z]
  `)
})

test('InvalidSerializedTransactionTypeError', () => {
  expect(
    new InvalidSerializedTransactionTypeError({
      serializedType: '0x111',
    }),
  ).toMatchInlineSnapshot(`
    [InvalidSerializedTransactionType: Serialized transaction type "0x111" is invalid.

    Version: viem@x.y.z]
  `)
})

test('InvalidSerializedTransactionError', () => {
  expect(
    new InvalidSerializedTransactionError({
      attributes: {
        chainId: null,
        to: null,
      },
      serializedTransaction: '0x02ce01',
      type: 'eip1559',
    }),
  ).toMatchInlineSnapshot(`
    [InvalidSerializedTransactionError: Invalid serialized transaction of type "eip1559" was provided.

    Serialized Transaction: "0x02ce01"

    Version: viem@x.y.z]
  `)
})

test('FeeConflictError', () => {
  expect(new FeeConflictError()).toMatchInlineSnapshot(`
    [FeeConflictError: Cannot specify both a \`gasPrice\` and a \`maxFeePerGas\`/\`maxPriorityFeePerGas\`.
    Use \`maxFeePerGas\`/\`maxPriorityFeePerGas\` for EIP-1559 compatible networks, and \`gasPrice\` for others.

    Version: viem@x.y.z]
  `)
})

describe('TransactionExecutionError', () => {
  test('no args', async () => {
    expect(
      new TransactionExecutionError(new BaseError('error'), {
        account: parseAccount(address.vitalik),
      }),
    ).toMatchInlineSnapshot(`
      [TransactionExecutionError: error

      Request Arguments:
        from:  0xd8da6bf26964af9d7eed9e03e53415d37aa96045

      Version: viem@x.y.z]
    `)
  })

  test('w/ base args', async () => {
    expect(
      new TransactionExecutionError(new BaseError('error'), {
        account: parseAccount(address.vitalik),
        to: address.usdcHolder,
        data: '0x123',
        gas: 420n,
        nonce: 69,
        value: 420n,
      }),
    ).toMatchInlineSnapshot(`
      [TransactionExecutionError: error

      Request Arguments:
        from:   0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:     0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        value:  0.00000000000000042 ETH
        data:   0x123
        gas:    420
        nonce:  69

      Version: viem@x.y.z]
    `)
  })

  test('w/ eip1559 args', async () => {
    expect(
      new TransactionExecutionError(new BaseError('error'), {
        account: parseAccount(address.vitalik),
        to: address.usdcHolder,
        data: '0x123',
        gas: 420n,
        nonce: 69,
        maxFeePerGas: 420n,
        maxPriorityFeePerGas: 69n,
      }),
    ).toMatchInlineSnapshot(`
      [TransactionExecutionError: error

      Request Arguments:
        from:                  0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:                    0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        data:                  0x123
        gas:                   420
        maxFeePerGas:          0.00000042 gwei
        maxPriorityFeePerGas:  0.000000069 gwei
        nonce:                 69

      Version: viem@x.y.z]
    `)
  })

  test('w/ legacy args', async () => {
    expect(
      new TransactionExecutionError(new BaseError('error'), {
        account: parseAccount(address.vitalik),
        to: address.usdcHolder,
        data: '0x123',
        gas: 420n,
        nonce: 69,
        gasPrice: 420n,
      }),
    ).toMatchInlineSnapshot(`
      [TransactionExecutionError: error

      Request Arguments:
        from:      0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:        0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        data:      0x123
        gas:       420
        gasPrice:  0.00000042 gwei
        nonce:     69

      Version: viem@x.y.z]
    `)
  })

  test('w/ chain', async () => {
    expect(
      new TransactionExecutionError(new BaseError('error'), {
        chain: polygon,
        account: parseAccount(address.vitalik),
        to: address.usdcHolder,
        data: '0x123',
        gas: 420n,
        nonce: 69,
        value: 420n,
      }),
    ).toMatchInlineSnapshot(`
      [TransactionExecutionError: error

      Request Arguments:
        chain:  Polygon (id: 137)
        from:   0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:     0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        value:  0.00000000000000042 POL
        data:   0x123
        gas:    420
        nonce:  69

      Version: viem@x.y.z]
    `)
  })

  test('w/ metaMessages', async () => {
    expect(
      new TransactionExecutionError(
        new BaseError('error', { metaMessages: ['omggg!'] }),
        {
          chain: polygon,
          account: parseAccount(address.vitalik),
          to: address.usdcHolder,
          data: '0x123',
          gas: 420n,
          nonce: 69,
          value: 420n,
        },
      ),
    ).toMatchInlineSnapshot(`
      [TransactionExecutionError: error

      omggg!
       
      Request Arguments:
        chain:  Polygon (id: 137)
        from:   0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:     0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        value:  0.00000000000000042 POL
        data:   0x123
        gas:    420
        nonce:  69

      Version: viem@x.y.z]
    `)
  })
})

describe('TransactionNotFoundError', () => {
  test('no args', async () => {
    expect(new TransactionNotFoundError({})).toMatchInlineSnapshot(`
      [TransactionNotFoundError: Transaction could not be found.

      Version: viem@x.y.z]
    `)
  })

  test('blockHash', async () => {
    expect(
      new TransactionNotFoundError({ blockHash: '0x123', index: 420 }),
    ).toMatchInlineSnapshot(`
      [TransactionNotFoundError: Transaction at block hash "0x123" at index "420" could not be found.

      Version: viem@x.y.z]
    `)
  })

  test('blockTag', async () => {
    expect(
      new TransactionNotFoundError({ blockTag: 'latest', index: 420 }),
    ).toMatchInlineSnapshot(`
      [TransactionNotFoundError: Transaction at block time "latest" at index "420" could not be found.

      Version: viem@x.y.z]
    `)
  })

  test('blockNumber', async () => {
    expect(
      new TransactionNotFoundError({ blockNumber: 42069n, index: 420 }),
    ).toMatchInlineSnapshot(`
      [TransactionNotFoundError: Transaction at block number "42069" at index "420" could not be found.

      Version: viem@x.y.z]
    `)
  })

  test('hash', async () => {
    expect(
      new TransactionNotFoundError({ hash: '0x123' }),
    ).toMatchInlineSnapshot(`
      [TransactionNotFoundError: Transaction with hash "0x123" could not be found.

      Version: viem@x.y.z]
    `)
  })
})

test('TransactionReceiptNotFoundError', () => {
  const error = new TransactionReceiptNotFoundError({
    hash: '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98a',
  })

  expect(error.message).toMatchInlineSnapshot(`
    "Transaction receipt with hash "0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98a" could not be found. The Transaction may not be processed on a block yet.

    Version: viem@x.y.z"
  `)
})

test('WaitForTransactionReceiptTimeoutError', () => {
  expect(() => {
    throw new WaitForTransactionReceiptTimeoutError({ hash: '0x123' })
  }).toThrowError(WaitForTransactionReceiptTimeoutError)
})
