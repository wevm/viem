import * as Value from 'ox/Value'
import { expect, test } from 'vitest'

import { Account, Actions, testActions, walletActions } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = client.extend(testActions())
const walletClient = client.extend(walletActions())
const source = constants.accounts[0]
const target = constants.accounts[1]
const account = Account.fromPrivateKey(source.privateKey)

test('decorates a client with wallet actions', async () => {
  await testClient.address.setBalance({
    address: source.address,
    value: source.balance,
  })
  const hash = await walletClient.transaction.send({
    account,
    to: target.address,
    value: Value.fromEther('0.0001'),
  })
  await testClient.block.mine({ blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })

  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
})
