import { Actions, publicActions } from 'viem'
import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

const client = anvil.getClient(anvil.mainnet)

test('default: uninstalls a block filter', async () => {
  const id = await client.request({ method: 'eth_newBlockFilter' })
  const filter = { id, request: client.request, type: 'block' } as const

  expect(await Actions.filter.uninstall(client, { filter })).toBe(true)
  // A second uninstall of the same id is a no-op.
  expect(await Actions.filter.uninstall(client, { filter })).toBe(false)
})

test('behavior: install → changes → uninstall round-trip', async () => {
  const filter = await Actions.block.createFilter(client)

  await Actions.block.mine(client, { blocks: 1 })
  const changes = await Actions.filter.getChanges(client, { filter })
  expect(changes.length).toBe(1)

  expect(await Actions.filter.uninstall(client, { filter })).toBe(true)
  await expect(
    Actions.filter.getChanges(client, { filter }),
  ).rejects.toThrowError('filter not found')
  expect(await Actions.filter.uninstall(client, { filter })).toBe(false)
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  const id = await client.request({ method: 'eth_newBlockFilter' })
  const filter = { id, request: client.request, type: 'block' } as const

  expect(await decorated.filter.uninstall({ filter })).toBe(true)
})
