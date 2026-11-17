import { Actions, publicActions } from 'viem'
import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getClient(anvil.mainnet)

const a = constants.accounts[0].address
const b = constants.accounts[1].address

test('default: creates a pending transaction filter that round-trips', async () => {
  const filter = await Actions.transaction.createPendingFilter(client)
  expect(filter.type).toBe('transaction')
  expect(typeof filter.id).toBe('string')

  const hash = await Actions.transaction.send(client, {
    account: a,
    to: b,
    value: 1n,
  })
  const changes = await Actions.filter.getChanges(client, { filter })
  expect(changes).toContain(hash)

  expect(await Actions.filter.uninstall(client, { filter })).toBe(true)
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  const filter = await decorated.transaction.createPendingFilter()
  expect(filter.type).toBe('transaction')

  await decorated.filter.uninstall({ filter })
})
