import { Hash, Value } from 'ox'
import { expect, test } from 'vitest'

import { Account, Actions, Client, http, testActions } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getClient(anvil.mainnet)

const localClient = Client.create({
  account: Account.fromPrivateKey(constants.accounts[0]!.privateKey),
  transport: http(anvil.local.rpcUrl.http),
}).extend(testActions())

// The first transaction of the pinned fork-tip block. anvil caches the fork
// block, so the raw transaction is deterministic and independent of the
// upstream.
const hash =
  '0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926'

test('default', async () => {
  const rawTransaction = await Actions.transaction.getRaw(client, { hash })
  expect(Hash.keccak256(rawTransaction)).toBe(hash)
})

test('behavior: pending transaction', async () => {
  const hash = await Actions.transaction.send(localClient, {
    to: constants.accounts[1]!.address,
    value: Value.fromEther('1'),
  })

  const rawTransaction = await Actions.transaction.getRaw(localClient, {
    hash,
  })
  expect(Hash.keccak256(rawTransaction)).toBe(hash)

  await localClient.block.mine({ blocks: 1 })

  const rawTransaction_mined = await Actions.transaction.getRaw(localClient, {
    hash,
  })
  expect(Hash.keccak256(rawTransaction_mined)).toBe(hash)
})

test('error: transaction not found', async () => {
  await expect(() =>
    Actions.transaction.getRaw(localClient, {
      hash: '0x0000000000000000000000000000000000000000000000000000000000000001',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Transaction.NotFoundError: Transaction with hash "0x0000000000000000000000000000000000000000000000000000000000000001" could not be found.

    Version: viem@2.52.1]
  `)
})
