import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

describe('createEventFilter', () => {
  test('behavior: returns a hex filter identifier with default options', async () => {
    const client = anvil.getClient(anvilMainnet)

    const filterId = await actions.createEventFilter(client)

    expect(filterId).toMatch(/^0x[0-9a-f]+$/)
  })

  test('behavior: creates a filter scoped to an address', async () => {
    const client = anvil.getClient(anvilMainnet)

    const filterId = await actions.createEventFilter(client, {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    })

    expect(filterId).toMatch(/^0x[0-9a-f]+$/)
  })

  test('behavior: creates a filter scoped to a block range', async () => {
    const client = anvil.getClient(anvilMainnet)

    const filterId = await actions.createEventFilter(client, {
      fromBlock: 0n,
      toBlock: 'latest',
    })

    expect(filterId).toMatch(/^0x[0-9a-f]+$/)
  })

  test('behavior: creates a filter scoped to a blockHash', async () => {
    const client = anvil.getClient(anvilMainnet)

    const { hash: blockHash } = await actions.getBlock(client)

    const filterId = await actions.createEventFilter(client, {
      blockHash,
    })

    expect(filterId).toMatch(/^0x[0-9a-f]+$/)
  })
})
