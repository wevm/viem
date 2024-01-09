import { beforeAll, describe, expect, test } from 'vitest'

import { localHttpUrl } from '~test/src/constants.js'
import {
  publicClient,
  setBlockNumber,
  setVitalikResolver,
} from '~test/src/utils.js'
import { mainnet, optimism } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'

import { getEnsAddress } from './getEnsAddress.js'

beforeAll(async () => {
  await setBlockNumber(17431812n)
  await setVitalikResolver()
})

test('gets address for name', async () => {
  await expect(
    getEnsAddress(publicClient, { name: 'awkweb.eth' }),
  ).resolves.toMatchInlineSnapshot(
    '"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e"',
  )
})

test('gets address that starts with 0s for name', async () => {
  await expect(
    getEnsAddress(publicClient, { name: 'skeith.eth' }),
  ).resolves.toMatchInlineSnapshot(
    '"0x00A59Ec1F4BF9718EeE07078141b540272BAB807"',
  )
})

test('gets address for name with coinType', async () => {
  await expect(
    getEnsAddress(publicClient, { name: 'awkweb.eth', coinType: 60 }),
  ).resolves.toMatchInlineSnapshot(
    '"0xa0cf798816d4b9b9866b5330eea46a18382f251e"',
  )
})

test('name without address with coinType', async () => {
  await expect(
    getEnsAddress(publicClient, { name: 'awkweb.eth', coinType: 61 }),
  ).resolves.toBeNull()
})

test('name without address', async () => {
  await expect(
    getEnsAddress(publicClient, { name: 'another-unregistered-name.eth' }),
  ).resolves.toBeNull()
})

test('name with resolver that does not support addr', async () => {
  await expect(
    getEnsAddress(publicClient, { name: 'vitalik.eth' }),
  ).resolves.toBeNull()
})

test('name that looks like a hex', async () => {
  await expect(
    getEnsAddress(publicClient, { name: '0xyoshi.eth' }),
  ).resolves.toMatchInlineSnapshot(
    '"0xE332de3c84C305698675A73F366061941C78e3b4"',
  )
  await expect(
    getEnsAddress(publicClient, { name: '0xdeadbeef.eth' }),
  ).resolves.toMatchInlineSnapshot(
    '"0xA8cc612Ecb2E853d3A882b0F9cf5357C2D892aDb"',
  )
})

test('name with a label larger than 255 bytes', async () => {
  await expect(
    getEnsAddress(publicClient, {
      name: `${'9'.repeat(291)}.eth`,
      universalResolverAddress: '0xc0497e381f536be9ce14b0dd3817cbcae57d2f62',
    }),
  ).resolves.toMatchInlineSnapshot(
    `"0xcdf14B42e1D3c264F6955521944a50d9A4d5CF3a"`,
  )
})

test('offchain: gets address for name', async () => {
  await expect(
    getEnsAddress(publicClient, { name: 'jake.cb.id' }),
  ).resolves.toMatchInlineSnapshot(
    '"0xdAb929527D862F6A75422cf40a9fb0B53059D801"',
  )
})

test('offchain: name without address', async () => {
  await expect(
    getEnsAddress(publicClient, {
      name: 'loalsdsladasdhjasgdhasjdghasgdjgasjdasd.cb.id',
    }),
  ).resolves.toMatchInlineSnapshot('null')
})

test('offchain: aggregated', async () => {
  const client = createPublicClient({
    chain: mainnet,
    batch: { multicall: true },
    transport: http(process.env.VITE_ANVIL_FORK_URL),
  })

  const names = await Promise.all([
    getEnsAddress(client, { name: 'jake.cb.id' }),
    getEnsAddress(client, { name: 'brian.cb.id' }),
    getEnsAddress(client, {
      name: 'loalsdsladasdhjasgdhasjdghasgdjgasjdasd.cb.id',
    }),
  ])

  expect(names).toMatchInlineSnapshot(
    `
      [
        "0xdAb929527D862F6A75422cf40a9fb0B53059D801",
        "0xc1D9D4E2fACf0F4E72Cad1579Ac7a86598dd605D",
        null,
      ]
    `,
  )
})

test('custom universal resolver address', async () => {
  await expect(
    getEnsAddress(publicClient, {
      name: 'awkweb.eth',
      universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
    }),
  ).resolves.toMatchInlineSnapshot(
    '"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e"',
  )
})

describe('universal resolver with custom errors', () => {
  test('name without resolver', async () => {
    await expect(
      getEnsAddress(publicClient, {
        name: 'random123.zzz',
        universalResolverAddress: '0x9380F1974D2B7064eA0c0EC251968D8c69f0Ae31',
      }),
    ).resolves.toBeNull()
  })
  test('name with invalid wildcard resolver', async () => {
    await expect(
      getEnsAddress(publicClient, {
        name: 'another-unregistered-name.eth',
        universalResolverAddress: '0x9380F1974D2B7064eA0c0EC251968D8c69f0Ae31',
      }),
    ).resolves.toBeNull()
  })
})

test('chain not provided', async () => {
  await expect(
    getEnsAddress(
      createPublicClient({
        transport: http(localHttpUrl),
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
      createPublicClient({
        chain: optimism,
        transport: http(),
      }),
      { name: 'awkweb.eth' },
    ),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ChainDoesNotSupportContract: Chain "OP Mainnet" does not support contract "ensUniversalResolver".

    This could be due to any of the following:
    - The chain does not have the contract "ensUniversalResolver" configured.

    Version: viem@1.0.2]
  `)
})

test('universal resolver contract deployed on later block', async () => {
  await expect(
    getEnsAddress(publicClient, { name: 'awkweb.eth', blockNumber: 14353601n }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ChainDoesNotSupportContract: Chain "Localhost" does not support contract "ensUniversalResolver".

    This could be due to any of the following:
    - The contract "ensUniversalResolver" was not deployed until block 16966585 (current block 14353601).

    Version: viem@1.0.2]
  `)
})

test('invalid universal resolver address', async () => {
  await expect(
    getEnsAddress(publicClient, {
      name: 'awkweb.eth',
      universalResolverAddress: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "resolve" reverted.

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  resolve(bytes name, bytes data)
      args:             (0x0661776b7765620365746800, 0x3b3b57de52d0f5fbf348925621be297a61b88ec492ebbbdfa9477d82892e2786020ad61c)

    Docs: https://viem.sh/docs/contract/readContract.html
    Version: viem@1.0.2]
  `)
})
