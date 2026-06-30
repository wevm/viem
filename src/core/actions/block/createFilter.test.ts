import { Actions, publicActions } from 'viem'
import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

const client = anvil.getClient(anvil.mainnet)

test('default: creates a block filter that round-trips', async () => {
  const filter = await Actions.block.createFilter(client)
  expect(filter.type).toBe('block')
  expect(typeof filter.id).toBe('string')

  await Actions.test.block.mine(client, { blocks: 2 })
  const changes = await Actions.filter.getChanges(client, { filter })
  expect(changes.length).toBe(2)
  expect(changes.every((hash) => typeof hash === 'string')).toBe(true)

  expect(await Actions.filter.uninstall(client, { filter })).toBe(true)
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  const filter = await decorated.block.createFilter()
  expect(filter.type).toBe('block')

  await Actions.test.block.mine(client, { blocks: 1 })
  const changes = await decorated.filter.getChanges({ filter })
  expect(changes.length).toBe(1)

  await decorated.filter.uninstall({ filter })
})
