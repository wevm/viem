import { AbiFunction, AbiParameters, Ens, type Hex } from 'ox'
import * as anvil from '~test/anvil.js'
import {
  createBatchGatewayErrorServer,
  createOffchainResolverServer,
  setOffchainResolver,
  setVitalikResolver,
} from '~test/ens.js'
import { createServer } from '~test/http.js'
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  onTestFinished,
  test,
} from 'vitest'

import { Actions, Chain, Client, http, publicActions } from 'viem'
import { CcipRead } from 'viem/utils'
import { mainnet, optimism } from 'viem/chains'

import { getAddress } from './getAddress.js'
import { universalResolverResolveAbi } from './internal/abis.js'

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

    Version: viem@x.x.x]
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

describe('behavior: raw coinType responses', () => {
  const resolverAddress = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
  const resolveWithGateways = AbiFunction.fromAbi(
    universalResolverResolveAbi,
    'resolveWithGateways',
  )

  // Answers every request with a Universal Resolver result wrapping `data`.
  async function createResolver() {
    let data: Hex.Hex = '0x'
    const server = await createServer(async (req, res) => {
      let body = ''
      for await (const chunk of req) body += chunk
      const { id } = JSON.parse(body)
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          id,
          jsonrpc: '2.0',
          result: AbiFunction.encodeResult(resolveWithGateways, [
            data,
            resolverAddress,
          ]),
        }),
      )
    })
    onTestFinished(async () => {
      await server.close()
    })
    return {
      client: Client.create({ transport: http(server.url) }),
      resolve(response: Hex.Hex, coinType: bigint) {
        data = response
        return getAddress(this.client, {
          coinType,
          name: 'pokersback.com',
          universalResolverAddress: resolverAddress,
        }).catch((error) => error.name)
      },
    }
  }

  test.each(
    (['abi', 'raw'] as const).flatMap((encoding) =>
      [60n, 0x80000000n, Ens.toCoinType(10n), 0xffffffffn].map((coinType) => ({
        coinType,
        encoding,
      })),
    ),
  )(
    'decodes $encoding coinType $coinType responses with leading zeros',
    async ({ coinType, encoding }) => {
      const resolver = await createResolver()

      const addresses = []
      for (const address of [
        '0x1111111111111111111111111111111111111111',
        '0x0011111111111111111111111111111111111111',
        '0x0000111111111111111111111111111111111111',
        '0x0111111111111111111111111111111111111111',
        '0x0000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000020',
        '0x0000000000000000000000000000000000000040',
        '0x0000000000000000000000000000000000000000',
      ] as const)
        addresses.push(
          await resolver.resolve(
            encoding === 'raw'
              ? address
              : AbiParameters.encode([{ type: 'address' }], [address]),
            coinType,
          ),
        )

      expect(addresses).toMatchInlineSnapshot(`
        [
          "0x1111111111111111111111111111111111111111",
          "0x0011111111111111111111111111111111111111",
          "0x0000111111111111111111111111111111111111",
          "0x0111111111111111111111111111111111111111",
          "0x0000000000000000000000000000000000000001",
          "0x0000000000000000000000000000000000000020",
          "0x0000000000000000000000000000000000000040",
          null,
        ]
      `)
    },
  )

  test('preserves dynamic-bytes responses with leading zeros', async () => {
    const resolver = await createResolver()

    await expect(
      resolver.resolve(
        AbiParameters.encode(
          [{ type: 'bytes' }],
          ['0x0011111111111111111111111111111111111111'],
        ),
        60n,
      ),
    ).resolves.toMatchInlineSnapshot(
      `"0x0011111111111111111111111111111111111111"`,
    )
  })

  test('rejects malformed responses', async () => {
    const resolver = await createResolver()

    const errors = []
    for (const response of [
      '0x01000000000000000000000000534631bcf33bdb069fb20a93d2fdb9e4d4dd42cf',
      '0x1234',
      '0x010000000000000000000000000000000000000000000000000000000000000000',
    ] as const)
      errors.push(await resolver.resolve(response, 60n))

    expect(errors).toMatchInlineSnapshot(`
      [
        "Hex.IntegerOutOfRangeError",
        "AbiParameters.DataSizeTooSmallError",
        "Hex.IntegerOutOfRangeError",
      ]
    `)
  })

  test.each([501n, 0x7fffffffn, 0x100000000n])(
    'does not pad responses for non-EVM coinType %s',
    async (coinType) => {
      const resolver = await createResolver()

      const results = []
      for (const response of [
        AbiParameters.encode([{ type: 'uint256' }], [32n]),
        AbiParameters.encode([{ type: 'uint256' }], [1n]),
        '0x0000000000000000000000000000001111111111111111111111111111111111',
        '0x0011111111111111111111111111111111111111',
        AbiParameters.encode(
          [{ type: 'bytes' }],
          [
            '0x0000000000000000000000000000001111111111111111111111111111111111',
          ],
        ),
      ] as const)
        results.push(await resolver.resolve(response, coinType))

      expect(results).toMatchInlineSnapshot(`
        [
          "AbiParameters.DataSizeTooSmallError",
          "AbiParameters.DataSizeTooSmallError",
          "Hex.IntegerOutOfRangeError",
          "AbiParameters.DataSizeTooSmallError",
          "0x0000000000000000000000000000001111111111111111111111111111111111",
        ]
      `)
    },
  )
})
