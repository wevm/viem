import { Ens } from 'ox'
import * as anvil from '~test/anvil.js'
import {
  createBatchGatewayErrorServer,
  createOffchainResolverServer,
  setOffchainResolver,
  setVitalikResolver,
} from '~test/ens.js'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { Actions, Client, http, publicActions } from 'viem'
import { linea, mainnet, optimism } from 'viem/chains'

import { getText } from './getText.js'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})

beforeAll(async () => {
  await Actions.test.state.reset(client, {
    blockNumber: 23_085_558n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
  await setVitalikResolver(client)
})

test('gets text record for name', async () => {
  await expect(
    getText(client, {
      key: 'com.twitter',
      name: Ens.normalize('wagmi-dev.eth'),
    }),
  ).resolves.toMatchInlineSnapshot(`"wagmi_sh"`)
})

test('behavior: name without text record', async () => {
  await expect(
    getText(client, {
      key: 'com.does-not-exist',
      name: Ens.normalize('wagmi-dev.eth'),
    }),
  ).resolves.toBeNull()
})

test('behavior: unregistered name', async () => {
  await expect(
    getText(client, {
      key: 'com.twitter',
      name: Ens.normalize('unregistered-name-viem-v3.eth'),
    }),
  ).resolves.toBeNull()
})

test('behavior: resolver without text support', async () => {
  await expect(
    getText(client, {
      key: 'com.twitter',
      name: Ens.normalize('vitalik.eth'),
    }),
  ).resolves.toBeNull()
})

test('behavior: resolver without text support (strict)', async () => {
  await expect(
    getText(client, {
      key: 'com.twitter',
      name: Ens.normalize('vitalik.eth'),
      strict: true,
    }),
  ).rejects.toThrowError('reverted')
})

test('behavior: name without resolver (strict)', async () => {
  await expect(
    getText(client, {
      key: 'com.twitter',
      name: Ens.normalize('random1223232222.eth'),
      strict: true,
    }),
  ).rejects.toThrowError('reverted')
})

test('behavior: non-contract resolver', async () => {
  await expect(
    getText(client, {
      key: 'com.twitter',
      name: Ens.normalize('vbuterin.eth'),
    }),
  ).resolves.toBeNull()
})

test('behavior: non-contract resolver (strict)', async () => {
  await expect(
    getText(client, {
      key: 'com.twitter',
      name: Ens.normalize('vbuterin.eth'),
      strict: true,
    }),
  ).rejects.toThrowError('reverted')
})

describe('behavior: batch gateway http error', () => {
  test('non-strict', async () => {
    const server = await createBatchGatewayErrorServer()
    await expect(
      getText(client, {
        gatewayUrls: [server.url],
        key: 'email',
        name: Ens.normalize('1.offchainexample.eth'),
      }),
    ).resolves.toBeNull()
    await server.close()
  })

  test('strict', async () => {
    const server = await createBatchGatewayErrorServer()
    await expect(
      getText(client, {
        gatewayUrls: [server.url],
        key: 'email',
        name: Ens.normalize('1.offchainexample.eth'),
        strict: true,
      }),
    ).rejects.toThrowError('HttpError')
    await server.close()
  })
})

describe('behavior: offchain resolver', () => {
  let server: Awaited<ReturnType<typeof createOffchainResolverServer>>

  beforeAll(async () => {
    server = await createOffchainResolverServer({
      text: { 'com.twitter': 'jxom_' },
    })
    await setOffchainResolver(client, { name: 'jxom.eth', url: server.url })
  })
  afterAll(() => server.close())

  test('resolves offchain record', async () => {
    await expect(
      getText(client, {
        key: 'com.twitter',
        name: Ens.normalize('jxom.eth'),
      }),
    ).resolves.toMatchInlineSnapshot(`"jxom_"`)
  })

  test('name without record', async () => {
    await expect(
      getText(client, {
        key: 'com.does-not-exist',
        name: Ens.normalize('jxom.eth'),
      }),
    ).resolves.toBeNull()
  })
})

test('args: universalResolverAddress', async () => {
  await expect(
    getText(client, {
      key: 'com.twitter',
      name: Ens.normalize('wagmi-dev.eth'),
      universalResolverAddress: '0xED73a03F19e8D849E44a39252d222c6ad5217E1e',
    }),
  ).resolves.toMatchInlineSnapshot(`"wagmi_sh"`)
})

test('behavior: chainless client requires universalResolverAddress', async () => {
  const chainless = Client.create({
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  await expect(
    getText(chainless, {
      key: 'com.twitter',
      name: Ens.normalize('wagmi-dev.eth'),
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [BaseError: Client chain not configured. \`universalResolverAddress\` is required.

    Version: viem@2.52.1]
  `)
})

test('behavior: chain without ensUniversalResolver contract', async () => {
  const scoped = Client.create({
    chain: optimism,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  await expect(
    getText(scoped, {
      key: 'com.twitter',
      name: Ens.normalize('wagmi-dev.eth'),
    }),
  ).rejects.toThrowError('does not support contract "ensUniversalResolver"')
})

test('behavior: universalResolver deployed after blockNumber', async () => {
  await expect(
    getText(client, {
      blockNumber: 14_353_601n,
      key: 'com.twitter',
      name: Ens.normalize('wagmi-dev.eth'),
    }),
  ).rejects.toThrowError(
    'was not deployed until block 23085558 (current block 14353601)',
  )
})

test('behavior: invalid universalResolverAddress', async () => {
  await expect(
    getText(client, {
      key: 'com.twitter',
      name: Ens.normalize('wagmi-dev.eth'),
      universalResolverAddress: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    }),
  ).rejects.toThrowError()
})

test('behavior: chain ensTlds short-circuit', async () => {
  const scoped = Client.create({
    chain: linea,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  await expect(
    getText(scoped, {
      key: 'com.twitter',
      name: Ens.normalize('vitalik.eth'),
    }),
  ).resolves.toBeNull()
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  await expect(
    decorated.ens.getText({
      key: 'com.twitter',
      name: Ens.normalize('wagmi-dev.eth'),
    }),
  ).resolves.toMatchInlineSnapshot(`"wagmi_sh"`)
})
