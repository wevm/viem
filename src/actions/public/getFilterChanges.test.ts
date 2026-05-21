import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

describe('getFilterChanges', () => {
  test('behavior: returns new block hashes for a block filter', async () => {
    const client = anvil.getClient(anvilMainnet)

    const filterId = await actions.createBlockFilter(client)
    await actions.mine(client, { blocks: 2n })

    const changes = await actions.getFilterChanges(client, { filterId })

    expect(changes.length).toBeGreaterThanOrEqual(2)
    expect(changes.every((hash) => /^0x[0-9a-f]+$/.test(hash))).toBe(true)
  })

  test('behavior: returns an empty array when nothing changed', async () => {
    const client = anvil.getClient(anvilMainnet)

    const filterId = await actions.createBlockFilter(client)
    await actions.getFilterChanges(client, { filterId })

    const changes = await actions.getFilterChanges(client, { filterId })

    expect(changes).toMatchInlineSnapshot(`[]`)
  })

  test('behavior: returns empty logs for a fresh event filter', async () => {
    const client = anvil.getClient(anvilMainnet)

    const filterId = await actions.createEventFilter(client, {
      address: '0x0000000000000000000000000000000000000000',
      fromBlock: 'latest',
    })

    const changes = await actions.getFilterChanges(client, { filterId })

    expect(changes).toMatchInlineSnapshot(`[]`)
  })
})
