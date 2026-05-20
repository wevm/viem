import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { Client, http } from 'viem'
import * as actions from 'viem/actions'
import { Hex } from 'viem/utils'

const code = '0x6001600055'
const storageValue =
  '0x0000000000000000000000000000000000000000000000000000000000000069'

function createClient() {
  return Client.create({
    chain: anvilMainnet.chain,
    transport: http(anvilMainnet.rpcUrl.http),
  }).extend(actions.publicActions())
}

describe('mine', () => {
  test('behavior: mines blocks', async () => {
    const client = createClient()
    const before = await client.public.getBlockNumber({ cacheTime: 0 })

    await actions.mine(client, { blocks: 2n })

    const after = await client.public.getBlockNumber({ cacheTime: 0 })
    expect(after - before).toMatchInlineSnapshot(`2n`)
  })

  test('behavior: mines blocks with interval', async () => {
    const client = createClient()
    const before = await client.public.getBlock({ blockTag: 'latest' })

    await actions.mine(client, { blocks: 1n, interval: 12n })

    const after = await client.public.getBlock({ blockTag: 'latest' })
    expect(after.timestamp - before.timestamp).toMatchInlineSnapshot(`12n`)
  })
})

describe('setBalance', () => {
  test('behavior: sets account balance', async () => {
    const client = createClient()
    const address = '0x0000000000000000000000000000000000000102'

    await actions.setBalance(client, { address, value: 69n })

    expect(await client.public.getBalance({ address })).toMatchInlineSnapshot(
      `69n`,
    )
  })
})

describe('setCode', () => {
  test('behavior: sets account bytecode', async () => {
    const client = createClient()
    const address = '0x0000000000000000000000000000000000000103'

    await actions.setCode(client, { address, bytecode: code })

    expect(await client.public.getCode({ address })).toMatchInlineSnapshot(
      `"0x6001600055"`,
    )
  })
})

describe('setNonce', () => {
  test('behavior: sets account nonce', async () => {
    const client = createClient()
    const address = '0x0000000000000000000000000000000000000104'

    await actions.setNonce(client, { address, nonce: 69n })

    expect(
      await client.public.getTransactionCount({ address }),
    ).toMatchInlineSnapshot(`69n`)
  })
})

describe('setStorageAt', () => {
  test('behavior: sets account storage', async () => {
    const client = createClient()
    const address = '0x0000000000000000000000000000000000000105'
    const slot = 1n

    await actions.setStorageAt(client, {
      address,
      slot,
      value: storageValue,
    })

    expect(
      await client.public.getStorageAt({
        address,
        slot: Hex.fromNumber(slot),
      }),
    ).toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000000000000000000000000069"`,
    )
  })
})

describe('snapshot', () => {
  test('behavior: snapshots chain state', async () => {
    const client = createClient()

    expect(await actions.snapshot(client)).toMatch(/^0x[0-9a-f]+$/)
  })
})

describe('revert', () => {
  test('behavior: reverts chain state to a snapshot', async () => {
    const client = createClient()
    const address = '0x0000000000000000000000000000000000000106'

    await actions.setBalance(client, { address, value: 1n })
    const id = await actions.snapshot(client)
    await actions.setBalance(client, { address, value: 2n })
    await actions.revert(client, { id })

    expect(await client.public.getBalance({ address })).toMatchInlineSnapshot(
      `1n`,
    )
  })
})
