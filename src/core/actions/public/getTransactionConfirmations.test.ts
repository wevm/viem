import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

import { getTransactionConfirmations } from './getTransactionConfirmations.js'
import { getTransactionReceipt } from './getTransactionReceipt.js'

const client = anvil.getClient(anvil.mainnet)

// The first transaction of the pinned fork-tip block. anvil caches the fork
// block, so confirmations are deterministic: the tx sits on the chain tip, so
// `tip - txBlock + 1 === 1`.
const hash =
  '0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926'

describe('getTransactionConfirmations', () => {
  test('args: hash', async () => {
    const confirmations = await getTransactionConfirmations(client, { hash })
    expect(confirmations).toMatchInlineSnapshot('1n')
  })

  test('args: transactionReceipt', async () => {
    const transactionReceipt = await getTransactionReceipt(client, { hash })
    const confirmations = await getTransactionConfirmations(client, {
      transactionReceipt,
    })
    expect(confirmations).toMatchInlineSnapshot('1n')
  })

  test('behavior: pending transaction (no block) returns 0n', async () => {
    // TODO: replace with a real pending transaction once `sendTransaction` is
    // ported. A transaction (or receipt) without a `blockNumber` is one that
    // has not been mined yet.
    const confirmations = await getTransactionConfirmations(client, {
      transactionReceipt: { blockNumber: undefined } as never,
    })
    expect(confirmations).toMatchInlineSnapshot('0n')
  })

  test('error: transaction not found', async () => {
    await expect(() =>
      getTransactionConfirmations(client, {
        hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transaction.NotFoundError: Transaction with hash "0x0000000000000000000000000000000000000000000000000000000000000000" could not be found.

      Version: viem@2.52.1]
    `)
  })
})
