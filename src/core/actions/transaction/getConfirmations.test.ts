import { expect, test } from 'vitest'
import { Actions } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getClient(anvil.mainnet)

// The first transaction of the pinned fork-tip block. anvil caches the fork
// block, so confirmations are deterministic: the tx sits on the chain tip, so
// `tip - txBlock + 1 === 1`.
const hash =
  '0xa94e96a83d0c8ec8726d5393b832f2973bdb16249f8c84b01672b5a150010836'

test('args: hash', async () => {
  const confirmations = await Actions.transaction.getConfirmations(client, {
    hash,
  })
  expect(confirmations).toMatchInlineSnapshot('1n')
})

test('args: transactionReceipt', async () => {
  const transactionReceipt = await Actions.transaction.getReceipt(client, {
    hash,
  })
  const confirmations = await Actions.transaction.getConfirmations(client, {
    transactionReceipt,
  })
  expect(confirmations).toMatchInlineSnapshot('1n')
})

test('behavior: pending transaction (no block) returns 0n', async () => {
  // The anvil instance does not auto-mine, so the transaction stays pending
  // (no `blockNumber`) and confirmations resolve to 0n.
  const hash = await Actions.transaction.send(client, {
    account: constants.accounts[0].address,
    to: constants.accounts[1].address,
    value: 1n,
  })
  const confirmations = await Actions.transaction.getConfirmations(client, {
    hash,
  })
  expect(confirmations).toMatchInlineSnapshot('0n')
})

test('error: transaction not found', async () => {
  await expect(() =>
    Actions.transaction.getConfirmations(client, {
      hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Transaction.NotFoundError: Transaction with hash "0x0000000000000000000000000000000000000000000000000000000000000000" could not be found.

      Version: viem@2.52.1]
    `)
})
