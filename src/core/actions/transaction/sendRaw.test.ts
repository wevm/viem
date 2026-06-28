import * as Value from 'ox/Value'
import { expect, test } from 'vitest'

import { Account, Actions, testActions } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = anvil.getClient(anvil.mainnet).extend(testActions())

const account = Account.fromPrivateKey(constants.accounts[0].privateKey)
const to = constants.accounts[1].address

test('broadcasts a signed serialized transaction', async () => {
  const transaction = await Actions.transaction.sign(client, {
    account,
    prepare: true,
    to,
    value: Value.fromEther('1'),
  })
  const hash = await Actions.transaction.sendRaw(client, {
    transaction,
  })
  await testClient.block.mine({ blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })
  expect(receipt.status).toBe('success')
})

test('error: malformed serialized transaction', async () => {
  await expect(() =>
    Actions.transaction.sendRaw(client, {
      transaction: '0xdeadbeef',
    }),
  ).rejects.toThrowError()
})
