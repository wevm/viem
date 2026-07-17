import { Ens } from 'ox'
import * as anvil from '~test/anvil.js'
import {
  createBatchGatewayErrorServer,
  createOffchainResolverServer,
  setOffchainResolver,
  setVitalikResolver,
} from '~test/ens.js'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { Actions, Chain, Client, http, publicActions } from 'viem'
import { CcipRead } from 'viem/utils'
import { mainnet, optimism } from 'viem/chains'

import { getAddress } from './getAddress.js'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})
const unsafeRequest: CcipRead.Request = (options) =>
  CcipRead.request({ ...options, allowUnsafeUrls: true })
const ccipClient = Client.create({
  ccipRead: { request: unsafeRequest },
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})

// The ENS Universal Resolver deploys after the default fork block; re-pin
// this file's instance to an ENS-era block.
beforeAll(async () => {
  await Actions.state.reset(client, {
    blockNumber: mainnet.contracts!.ensUniversalResolver!.blockCreated
      ? BigInt(mainnet.contracts!.ensUniversalResolver!.blockCreated)
      : undefined,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
  await setVitalikResolver(client)
})

// Instances are shared across test files; restore the default fork.
afterAll(async () => {
  await Actions.state.reset(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 30_000)

test('gets address for name', async () => {
  await expect(
    getAddress(client, { name: Ens.normalize('wevm.eth') }),
  ).resolves.toMatchInlineSnapshot(
    `"0xd2135CfB216b74109775236E36d4b433F1DF507B"`,
  )
})

test('args: coinType', async () => {
  // Explicit coin types resolve through the `bytes`-typed `addr` overload,
  // so the result is not checksummed.
  await expect(
    getAddress(client, {
      coinType: 60n,
      name: Ens.normalize('wevm.eth'),
    }),
  ).resolves.toMatchInlineSnapshot(
    `"0xd2135cfb216b74109775236e36d4b433f1df507b"`,
  )
})

test('args: coinType (no record)', async () => {
  await expect(
    getAddress(client, {
      coinType: 61n,
      name: Ens.normalize('wevm.eth'),
    }),
  ).resolves.toBeNull()
})

test('args: coinType (ENSIP-11)', async () => {
  await expect(
    getAddress(client, {
      coinType: Ens.toCoinType(10n),
      name: Ens.normalize('taytems.eth'),
    }),
  ).resolves.toMatchInlineSnapshot(
    `"0x8e8db5ccef88cca9d624701db544989c996e3216"`,
  )
})

test('args: coinType (ENSIP-11, no record)', async () => {
  await expect(
    getAddress(client, {
      coinType: Ens.toCoinType(10n),
      name: Ens.normalize('awkweb.eth'),
    }),
  ).resolves.toBeNull()
})

test('behavior: address with leading zeros', async () => {
  await expect(
    getAddress(client, { name: Ens.normalize('skeith.eth') }),
  ).resolves.toMatchInlineSnapshot(
    `"0x00A59Ec1F4BF9718EeE07078141b540272BAB807"`,
  )
})

test('behavior: name that looks like a hex', async () => {
  await expect(
    getAddress(client, { name: Ens.normalize('0xyoshi.eth') }),
  ).resolves.toMatchInlineSnapshot(
    `"0xE332de3c84C305698675A73F366061941C78e3b4"`,
  )
  await expect(
    getAddress(client, { name: Ens.normalize('0xdeadbeef.eth') }),
  ).resolves.toMatchInlineSnapshot(
    `"0xA8cc612Ecb2E853d3A882b0F9cf5357C2D892aDb"`,
  )
})

test('behavior: name with a label larger than 255 bytes', async () => {
  await expect(
    getAddress(client, { name: `${'9'.repeat(291)}.eth` }),
  ).resolves.toMatchInlineSnapshot(
    `"0xcdf14B42e1D3c264F6955521944a50d9A4d5CF3a"`,
  )
})

test('behavior: resolver without addr support', async () => {
  await expect(
    getAddress(client, { name: Ens.normalize('vitalik.eth') }),
  ).resolves.toBeNull()
})

test('behavior: resolver without addr support (strict)', async () => {
  await expect(
    getAddress(client, {
      name: Ens.normalize('vitalik.eth'),
      strict: true,
    }),
  ).rejects.toThrowError('reverted')
})

test('args: blockNumber', async () => {
  await expect(
    getAddress(client, {
      blockNumber: 23_085_558n,
      name: Ens.normalize('wevm.eth'),
    }),
  ).resolves.toMatchInlineSnapshot(
    `"0xd2135CfB216b74109775236E36d4b433F1DF507B"`,
  )
})

test('args: universalResolverAddress', async () => {
  await expect(
    getAddress(client, {
      name: Ens.normalize('wevm.eth'),
      universalResolverAddress:
        mainnet.contracts!.ensUniversalResolver!.address,
    }),
  ).resolves.toMatchInlineSnapshot(
    `"0xd2135CfB216b74109775236E36d4b433F1DF507B"`,
  )
})

test('behavior: name without address record', async () => {
  await expect(
    getAddress(client, {
      name: Ens.normalize('unregistered-name-viem-v3.eth'),
    }),
  ).resolves.toBeNull()
})

test('args: strict (throws resolver errors)', async () => {
  await expect(
    getAddress(client, {
      name: Ens.normalize('unregistered-name-viem-v3.eth'),
      strict: true,
    }),
  ).rejects.toThrowError()
})

test('behavior: chain ensTlds short-circuit', async () => {
  const scoped = Client.create({
    chain: Chain.from({ ...mainnet, ensTlds: ['.box'] }),
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  await expect(
    getAddress(scoped, { name: Ens.normalize('wevm.eth') }),
  ).resolves.toBeNull()
})

describe('behavior: batch gateway http error', () => {
  test('non-strict', async () => {
    const server = await createBatchGatewayErrorServer()
    await expect(
      getAddress(ccipClient, {
        gatewayUrls: [server.url],
        name: Ens.normalize('1.offchainexample.eth'),
      }),
    ).resolves.toBeNull()
    await server.close()
  })

  test('strict', async () => {
    const server = await createBatchGatewayErrorServer()
    await expect(
      getAddress(ccipClient, {
        gatewayUrls: [server.url],
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
      address: '0x41563129cDbbD0c5D3e1c86cf9563926b243834d',
    })
    await setOffchainResolver(client, { name: 'jxom.eth', url: server.url })
  })
  afterAll(() => server.close())

  test('resolves offchain record', async () => {
    await expect(
      getAddress(ccipClient, { name: Ens.normalize('jxom.eth') }),
    ).resolves.toMatchInlineSnapshot(
      `"0x41563129cDbbD0c5D3e1c86cf9563926b243834d"`,
    )
  })

  test('decodes address-encoded coinType response', async () => {
    await expect(
      getAddress(ccipClient, {
        coinType: 60n,
        name: Ens.normalize('jxom.eth'),
      }),
    ).resolves.toMatchInlineSnapshot(
      `"0x41563129cDbbD0c5D3e1c86cf9563926b243834d"`,
    )
  })

  test('name without record', async () => {
    await expect(
      getAddress(ccipClient, {
        coinType: 61n,
        name: Ens.normalize('jxom.eth'),
      }),
    ).resolves.toBeNull()
  })

  test('aggregated', async () => {
    const batched = Client.create({
      batch: { multicall: true },
      ccipRead: { request: unsafeRequest },
      chain: mainnet,
      transport: http(anvil.mainnet.rpcUrl.http),
    })

    await expect(
      Promise.all([
        getAddress(batched, { name: Ens.normalize('jxom.eth') }),
        getAddress(batched, { name: Ens.normalize('wevm.eth') }),
        getAddress(batched, {
          coinType: 61n,
          name: Ens.normalize('jxom.eth'),
        }),
      ]),
    ).resolves.toMatchInlineSnapshot(`
      [
        "0x41563129cDbbD0c5D3e1c86cf9563926b243834d",
        "0xd2135CfB216b74109775236E36d4b433F1DF507B",
        null,
      ]
    `)
  })
})

test('behavior: chain without ensUniversalResolver contract', async () => {
  const scoped = Client.create({
    chain: optimism,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  await expect(
    getAddress(scoped, { name: Ens.normalize('wevm.eth') }),
  ).rejects.toThrowError('does not support contract "ensUniversalResolver"')
})

test('behavior: universalResolver deployed after blockNumber', async () => {
  await expect(
    getAddress(client, {
      blockNumber: 14_353_601n,
      name: Ens.normalize('wevm.eth'),
    }),
  ).rejects.toThrowError(
    'was not deployed until block 23085558 (current block 14353601)',
  )
})

test('behavior: invalid universalResolverAddress', async () => {
  await expect(
    getAddress(client, {
      name: Ens.normalize('wevm.eth'),
      universalResolverAddress: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    }),
  ).rejects.toThrowError()
})

test('behavior: chainless client requires universalResolverAddress', async () => {
  const chainless = Client.create({
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  await expect(getAddress(chainless, { name: Ens.normalize('wevm.eth') }))
    .rejects.toThrowErrorMatchingInlineSnapshot(`
    [BaseError: Client chain not configured. \`universalResolverAddress\` is required.

    Version: viem@2.52.1]
  `)

  await expect(
    getAddress(chainless, {
      name: Ens.normalize('wevm.eth'),
      universalResolverAddress:
        mainnet.contracts!.ensUniversalResolver!.address,
    }),
  ).resolves.toMatchInlineSnapshot(
    `"0xd2135CfB216b74109775236E36d4b433F1DF507B"`,
  )
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  await expect(
    decorated.ens.getAddress({ name: Ens.normalize('wevm.eth') }),
  ).resolves.toMatchInlineSnapshot(
    `"0xd2135CfB216b74109775236E36d4b433F1DF507B"`,
  )
})
