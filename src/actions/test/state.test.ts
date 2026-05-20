import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { Client, custom, http } from 'viem'
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

function createRecordingClient() {
  const requests: { method: string; params?: unknown | undefined }[] = []
  return {
    client: Client.create({
      transport: custom({
        async request(options) {
          requests.push(options)
          if (options.method === 'evm_snapshot') return '0x1'
          if (options.method === 'evm_revert') return true
        },
      }),
    }),
    requests,
  }
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
    expect(after.timestamp >= before.timestamp + 12n).toMatchInlineSnapshot(
      `true`,
    )
  })
})

describe('mode', () => {
  test('behavior: selects hardhat and ganache rpc branches', async () => {
    const { client, requests } = createRecordingClient()
    const address = '0x0000000000000000000000000000000000000201'

    await actions.mine(client, { blocks: 2n, interval: 3n, mode: 'hardhat' })
    await actions.mine(client, { blocks: 2n, interval: 3n, mode: 'ganache' })
    await actions.setBalance(client, { address, mode: 'hardhat', value: 4n })
    await actions.setBalance(client, { address, mode: 'ganache', value: 4n })
    await actions.setCode(client, { address, bytecode: code, mode: 'hardhat' })
    await actions.setCode(client, { address, bytecode: code, mode: 'ganache' })
    await actions.setNonce(client, { address, mode: 'hardhat', nonce: 5n })
    await actions.setNonce(client, { address, mode: 'ganache', nonce: 5n })
    await actions.setStorageAt(client, {
      address,
      mode: 'hardhat',
      slot: 6n,
      value: storageValue,
    })
    await actions.setStorageAt(client, {
      address,
      mode: 'ganache',
      slot: 6n,
      value: storageValue,
    })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "hardhat_mine",
          "params": [
            "0x2",
            "0x3",
          ],
        },
        {
          "method": "evm_mine",
          "params": [
            {
              "blocks": "0x2",
            },
          ],
        },
        {
          "method": "hardhat_setBalance",
          "params": [
            "0x0000000000000000000000000000000000000201",
            "0x4",
          ],
        },
        {
          "method": "evm_setAccountBalance",
          "params": [
            "0x0000000000000000000000000000000000000201",
            "0x4",
          ],
        },
        {
          "method": "hardhat_setCode",
          "params": [
            "0x0000000000000000000000000000000000000201",
            "0x6001600055",
          ],
        },
        {
          "method": "evm_setAccountCode",
          "params": [
            "0x0000000000000000000000000000000000000201",
            "0x6001600055",
          ],
        },
        {
          "method": "hardhat_setNonce",
          "params": [
            "0x0000000000000000000000000000000000000201",
            "0x5",
          ],
        },
        {
          "method": "ganache_setNonce",
          "params": [
            "0x0000000000000000000000000000000000000201",
            "0x5",
          ],
        },
        {
          "method": "hardhat_setStorageAt",
          "params": [
            "0x0000000000000000000000000000000000000201",
            "0x6",
            "0x0000000000000000000000000000000000000000000000000000000000000069",
          ],
        },
        {
          "method": "ganache_setStorageAt",
          "params": [
            "0x0000000000000000000000000000000000000201",
            "0x6",
            "0x0000000000000000000000000000000000000000000000000000000000000069",
          ],
        },
      ]
    `)
  })

  test('behavior: decorator mode selects rpc branches', async () => {
    const { client, requests } = createRecordingClient()
    const clientTest = client.extend(
      actions.testActions({ mode: 'hardhat' }),
    ).test
    const address = '0x0000000000000000000000000000000000000202'

    await clientTest.mine({ blocks: 1n })
    await clientTest.setBalance({ address, value: 2n })
    await clientTest.setCode({ address, bytecode: code })
    await clientTest.setNonce({ address, nonce: 3n })
    await clientTest.setStorageAt({ address, slot: 4n, value: storageValue })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "hardhat_mine",
          "params": [
            "0x1",
            "0x0",
          ],
        },
        {
          "method": "hardhat_setBalance",
          "params": [
            "0x0000000000000000000000000000000000000202",
            "0x2",
          ],
        },
        {
          "method": "hardhat_setCode",
          "params": [
            "0x0000000000000000000000000000000000000202",
            "0x6001600055",
          ],
        },
        {
          "method": "hardhat_setNonce",
          "params": [
            "0x0000000000000000000000000000000000000202",
            "0x3",
          ],
        },
        {
          "method": "hardhat_setStorageAt",
          "params": [
            "0x0000000000000000000000000000000000000202",
            "0x4",
            "0x0000000000000000000000000000000000000000000000000000000000000069",
          ],
        },
      ]
    `)
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
