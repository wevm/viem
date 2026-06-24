import * as Value from 'ox/Value'
import { describe, expect, test } from 'vitest'

import { Account, Actions, testActions } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = anvil.getClient(anvil.mainnet).extend(testActions())

const account = Account.fromPrivateKey(constants.accounts[0].privateKey)
const to = constants.accounts[1].address

describe('sendRaw', () => {
  test('broadcasts a signed serialized transaction', async () => {
    const serializedTransaction = await Actions.transaction.sign(client, {
      account,
      prepare: true,
      to,
      value: Value.fromEther('1'),
    })
    const hash = await Actions.transaction.sendRaw(client, {
      serializedTransaction,
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })
})
