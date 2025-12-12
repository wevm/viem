import { beforeAll, expect, test } from 'vitest'

import { createHttpServer, setVitalikResolver } from '~test/src/utils.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { linea, mainnet, optimism } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { toCoinType } from '../../ens/index.js'
import { reset } from '../test/reset.js'
import { getEnsAddress } from './getEnsAddress.js'

const client = anvilMainnet.getClient()

beforeAll(async () => {
  await reset(client, {
    blockNumber: 23_085_558n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
  await setVitalikResolver()
})

test('gets address for name', async () => {
  await expect(
    getEnsAddress(client, { name: 'awkweb.eth' }),
  ).resolves.toMatchInlineSnapshot(
    '"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e"',
  )
})

test('gatewayUrls provided', async () => {
  let called = false

  const server = await createHttpServer((_, res) => {
    called = true
    res.end()
  })

  await getEnsAddress(client, {
    name: '1.offchainexample.eth',
    gatewayUrls: [server.url],
  }).catch(() => {})

  expect(called).toBe(true)
})

test('gets address that starts with 0s for name', async () => {
  await expect(
    getEnsAddress(client, { name: 'skeith.eth' }),
  ).resolves.toMatchInlineSnapshot(
    '"0x00A59Ec1F4BF9718EeE07078141b540272BAB807"',
  )
})

test('gets address for name with coinType', async () => {
  await expect(
    getEnsAddress(client, { name: 'awkweb.eth', coinType: 60n }),
  ).resolves.toMatchInlineSnapshot(
    '"0xa0cf798816d4b9b9866b5330eea46a18382f251e"',
  )
})

test('gets address for name with coinType', async () => {
  await expect(
    getEnsAddress(client, { name: 'awkweb.eth', coinType: toCoinType(1) }),
  ).resolves.toMatchInlineSnapshot(
    '"0xa0cf798816d4b9b9866b5330eea46a18382f251e"',
  )
})

test('name without address with coinType', async () => {
  await expect(
    getEnsAddress(client, { name: 'awkweb.eth', coinType: 61n }),
  ).resolves.toBeNull()
})

test('name with address with chainId', async () => {
  await expect(
    getEnsAddress(client, { name: 'taytems.eth', coinType: toCoinType(10) }),
  ).resolves.toMatchInlineSnapshot(
    '"0x8e8db5ccef88cca9d624701db544989c996e3216"',
  )
})

test('name without address with chainId', async () => {
  await expect(
    getEnsAddress(client, { name: 'awkweb.eth', coinType: toCoinType(10) }),
  ).resolves.toBeNull()
})

test('name without address', async () => {
  await expect(
    getEnsAddress(client, { name: 'another-unregistered-name.eth' }),
  ).resolves.toBeNull()
})

test('name with resolver that does not support addr', async () => {
  await expect(
    getEnsAddress(client, { name: 'vitalik.eth' }),
  ).resolves.toBeNull()
})

test('name with resolver that does not support addr - strict', async () => {
  await expect(
    getEnsAddress(client, { name: 'vitalik.eth', strict: true }),
  ).rejects.toMatchInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "resolveWithGateways" reverted.

    Error: ResolverError(bytes errorData)
                        (0x)
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  resolveWithGateways(bytes name, bytes data, string[] gateways)
      args:                         (0x07766974616c696b0365746800, 0x3b3b57deee6c4522aab0003e8d14cd40a6af439055fd2577951148c14b6cea9a53475835, ["x-batch-gateway:true"])

    Docs: https://viem.sh/docs/contract/readContract
    Version: viem@x.y.z]
  `)
})

test('name that looks like a hex', async () => {
  await expect(
    getEnsAddress(client, { name: '0xyoshi.eth' }),
  ).resolves.toMatchInlineSnapshot(
    '"0xE332de3c84C305698675A73F366061941C78e3b4"',
  )
  await expect(
    getEnsAddress(client, { name: '0xdeadbeef.eth' }),
  ).resolves.toMatchInlineSnapshot(
    '"0xA8cc612Ecb2E853d3A882b0F9cf5357C2D892aDb"',
  )
})

test('name with a label larger than 255 bytes', async () => {
  await expect(
    getEnsAddress(client, {
      name: `${'9'.repeat(291)}.eth`,
    }),
  ).resolves.toMatchInlineSnapshot(
    `"0xcdf14B42e1D3c264F6955521944a50d9A4d5CF3a"`,
  )
})

test('offchain: gets address for name', async () => {
  await expect(
    getEnsAddress(client, { name: '1.offchainexample.eth' }),
  ).resolves.toMatchInlineSnapshot(
    `"0x41563129cDbbD0c5D3e1c86cf9563926b243834d"`,
  )
})

test('offchain: name without address', async () => {
  await expect(
    getEnsAddress(client, {
      name: 'loalsdsladasdhjasgdhasjdghasgdjgasjdasd.cb.id',
    }),
  ).resolves.toBeNull()
})

test('offchain: aggregated', async () => {
  const client = createClient({
    chain: mainnet,
    batch: { multicall: true },
    transport: http(process.env.VITE_ANVIL_FORK_URL),
  })

  const names = await Promise.all([
    getEnsAddress(client, { name: '1.offchainexample.eth' }),
    getEnsAddress(client, { name: '2.offchainexample.eth' }),
    getEnsAddress(client, {
      name: 'loalsdsladasdhjasgdhasjdghasgdjgasjdasd.cb.id',
    }),
  ])

  expect(names).toMatchInlineSnapshot(
    `
    [
      "0x41563129cDbbD0c5D3e1c86cf9563926b243834d",
      "0x41563129cDbbD0c5D3e1c86cf9563926b243834d",
      null,
    ]
  `,
  )
})

test('custom universal resolver address', async () => {
  await expect(
    getEnsAddress(client, {
      name: 'awkweb.eth',
      universalResolverAddress: '0xED73a03F19e8D849E44a39252d222c6ad5217E1e',
    }),
  ).resolves.toMatchInlineSnapshot(
    '"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e"',
  )
})

test('chain not provided', async () => {
  await expect(
    getEnsAddress(
      createClient({
        transport: http(anvilMainnet.rpcUrl.http),
      }),
      { name: 'awkweb.eth' },
    ),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    '[Error: client chain not configured. universalResolverAddress is required.]',
  )
})

test('universal resolver contract not configured for chain', async () => {
  await expect(
    getEnsAddress(
      createClient({
        chain: optimism,
        transport: http(),
      }),
      { name: 'awkweb.eth' },
    ),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ChainDoesNotSupportContract: Chain "OP Mainnet" does not support contract "ensUniversalResolver".

    This could be due to any of the following:
    - The chain does not have the contract "ensUniversalResolver" configured.

    Version: viem@x.y.z]
  `)
})

test('universal resolver contract deployed on later block', async () => {
  await expect(
    getEnsAddress(client, { name: 'awkweb.eth', blockNumber: 14353601n }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ChainDoesNotSupportContract: Chain "Ethereum (Local)" does not support contract "ensUniversalResolver".

    This could be due to any of the following:
    - The contract "ensUniversalResolver" was not deployed until block 23085558 (current block 14353601).

    Version: viem@x.y.z]
  `)
})

test('invalid universal resolver address', async () => {
  await expect(
    getEnsAddress(client, {
      name: 'awkweb.eth',
      universalResolverAddress: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "resolveWithGateways" reverted.

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  resolveWithGateways(bytes name, bytes data, string[] gateways)
      args:                         (0x0661776b7765620365746800, 0x3b3b57de52d0f5fbf348925621be297a61b88ec492ebbbdfa9477d82892e2786020ad61c, ["x-batch-gateway:true"])

    Docs: https://viem.sh/docs/contract/readContract
    Version: viem@x.y.z]
  `)
})

test('invalid TLD', async () => {
  const client = createClient({
    chain: linea,
    transport: http(),
  })
  await expect(
    getEnsAddress(client, { name: 'vitalik.eth' }),
  ).resolves.toBeNull()
})
