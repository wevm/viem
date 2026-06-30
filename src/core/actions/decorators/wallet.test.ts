import * as Value from 'ox/Value'
import { expect, test } from 'vitest'

import { Account, Actions, testActions, walletActions } from 'viem'
import { avalanche } from 'viem/chains'

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

test('decorates a client with chains actions', async () => {
  const client = anvil.getWalletClient(anvil.mainnet).extend(walletActions())
  await client.chains.add({ chain: avalanche })
  await client.chains.switch({ id: avalanche.id })
})

test('decorates a client with wallet sign actions', async () => {
  const client = anvil.getWalletClient(anvil.mainnet).extend(walletActions())
  const signature = await client.signMessage({
    account,
    message: 'hello world',
  })
  expect(signature).toMatchInlineSnapshot(
    `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"`,
  )
})
