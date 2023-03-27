import { describe, expect, test } from 'vitest'
import { polygon } from '../chains.js'
import { getAccount } from '../utils/index.js'
import { address } from '../_test.js'
import { BaseError } from './base.js'
import {
  FeeConflictError,
  TransactionExecutionError,
  TransactionNotFoundError,
  TransactionReceiptNotFoundError,
  WaitForTransactionReceiptTimeoutError,
} from './transaction.js'

test('FeeConflictError', () => {
  expect(new FeeConflictError()).toMatchInlineSnapshot(`
    [FeeConflictError: Cannot specify both a \`gasPrice\` and a \`maxFeePerGas\`/\`maxPriorityFeePerGas\`.
    Use \`maxFeePerGas\`/\`maxPriorityFeePerGas\` for EIP-1559 compatible networks, and \`gasPrice\` for others.

    Version: viem@1.0.2]
  `)
})

describe('TransactionExecutionError', () => {
  test('no args', async () => {
    expect(
      new TransactionExecutionError(new BaseError('error'), {
        account: getAccount(address.vitalik),
      }),
    ).toMatchInlineSnapshot(`
      [TransactionExecutionError: error

      Request Arguments:
        from:  0xd8da6bf26964af9d7eed9e03e53415d37aa96045

      Version: viem@1.0.2]
    `)
  })

  test('w/ base args', async () => {
    expect(
      new TransactionExecutionError(new BaseError('error'), {
        account: getAccount(address.vitalik),
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

      Version: viem@1.0.2]
    `)
  })

  test('w/ eip1559 args', async () => {
    expect(
      new TransactionExecutionError(new BaseError('error'), {
        account: getAccount(address.vitalik),
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

      Version: viem@1.0.2]
    `)
  })

  test('w/ legacy args', async () => {
    expect(
      new TransactionExecutionError(new BaseError('error'), {
        account: getAccount(address.vitalik),
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

      Version: viem@1.0.2]
    `)
  })

  test('w/ chain', async () => {
    expect(
      new TransactionExecutionError(new BaseError('error'), {
        chain: polygon,
        account: getAccount(address.vitalik),
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
        value:  0.00000000000000042 MATIC
        data:   0x123
        gas:    420
        nonce:  69

      Version: viem@1.0.2]
    `)
  })

  test('w/ metaMessages', async () => {
    expect(
      new TransactionExecutionError(
        new BaseError('error', { metaMessages: ['omggg!'] }),
        {
          chain: polygon,
          account: getAccount(address.vitalik),
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
        value:  0.00000000000000042 MATIC
        data:   0x123
        gas:    420
        nonce:  69

      Version: viem@1.0.2]
    `)
  })
})

describe('TransactionNotFoundError', () => {
  test('no args', async () => {
    expect(new TransactionNotFoundError({})).toMatchInlineSnapshot(`
      [TransactionNotFoundError: Transaction could not be found.

      Version: viem@1.0.2]
    `)
  })

  test('blockHash', async () => {
    expect(
      new TransactionNotFoundError({ blockHash: '0x123', index: 420 }),
    ).toMatchInlineSnapshot(`
      [TransactionNotFoundError: Transaction at block hash "0x123" at index "420" could not be found.

      Version: viem@1.0.2]
    `)
  })

  test('blockTag', async () => {
    expect(
      new TransactionNotFoundError({ blockTag: 'latest', index: 420 }),
    ).toMatchInlineSnapshot(`
      [TransactionNotFoundError: Transaction at block time "latest" at index "420" could not be found.

      Version: viem@1.0.2]
    `)
  })

  test('blockNumber', async () => {
    expect(
      new TransactionNotFoundError({ blockNumber: 42069n, index: 420 }),
    ).toMatchInlineSnapshot(`
      [TransactionNotFoundError: Transaction at block number "42069" at index "420" could not be found.

      Version: viem@1.0.2]
    `)
  })

  test('hash', async () => {
    expect(
      new TransactionNotFoundError({ hash: '0x123' }),
    ).toMatchInlineSnapshot(`
      [TransactionNotFoundError: Transaction with hash "0x123" could not be found.

      Version: viem@1.0.2]
    `)
  })
})

test('TransactionReceiptNotFoundError', () => {
  const error = new TransactionReceiptNotFoundError({
    hash: '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98a',
  })

  expect(error.message).toMatchInlineSnapshot(`
    "Transaction receipt with hash \\"0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98a\\" could not be found. The Transaction may not be processed on a block yet.

    Version: viem@1.0.2"
  `)
})

test('WaitForTransactionReceiptTimeoutError', () => {
  expect(() => {
    throw new WaitForTransactionReceiptTimeoutError({ hash: '0x123' })
  }).toThrowError(WaitForTransactionReceiptTimeoutError)
})
