import { Actions, Client, fallback, http } from 'viem'
import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

test('fallback: binds the filter to the child transport that created it', async () => {
  // First transport is dead; the filter is created on (and bound to) the
  // second, working transport. `getChanges` then reaches it directly via the
  // scoped `filter.request`.
  const client = Client.create({
    transport: fallback([
      http('http://127.0.0.1:1'),
      http(anvil.mainnet.rpcUrl.http),
    ]),
  })

  const filter = await Actions.block.createFilter(client)
  expect(filter.type).toBe('block')

  await Actions.block.mine(client, { blocks: 2 })
  const changes = await Actions.filter.getChanges(client, { filter })
  expect(changes.length).toBe(2)

  expect(await Actions.filter.uninstall(client, { filter })).toBe(true)
})
