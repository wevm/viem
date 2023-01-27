import { describe, expect, test } from "vitest"
import { InvalidGasArgumentsError, TransactionNotFoundError, TransactionReceiptNotFoundError, WaitForTransactionReceiptTimeoutError } from "./transaction"

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

test('InvalidGasArgumentsError', () => {
  expect(new InvalidGasArgumentsError()).toMatchInlineSnapshot(`
    [InvalidGasArgumentsError: \`maxFeePerGas\` cannot be less than \`maxPriorityFeePerGas\`

    Version: viem@1.0.2]
  `)
})
