import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Actions, Client, http, testActions } from 'viem'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(testActions())

const { address } = constants.accounts[0]

test('drops a pending transaction', async () => {
  await client.block.setAutomine({ enabled: false })
  await client.address.setBalance({
    address,
    value: 10_000_000_000_000_000_000n,
  })
  await client.address.impersonate({ address })
  const hash = await Actions.transaction.send(client, {
    account: address,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1n,
  })
  await client.txpool.dropTransaction({ hash })
  expect(
    await client.request({
      method: 'eth_getTransactionByHash',
      params: [hash],
    }),
  ).toBeNull()
  await client.address.stopImpersonating({ address })
})
