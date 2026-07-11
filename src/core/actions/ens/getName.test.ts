import * as anvil from '~test/anvil.js'
import {
  createBatchGatewayErrorServer,
  setPrimaryName,
  setVitalikResolver,
  vitalik,
} from '~test/ens.js'
import { beforeAll, describe, expect, test } from 'vitest'

import { Actions, CcipRead, Client, http, publicActions } from 'viem'
import { mainnet, optimism } from 'viem/chains'

import { getName } from './getName.js'

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

// Pinned after the ENSIP-19 default-reverse records used by the `coinType`
// test were set onchain.
beforeAll(async () => {
  await Actions.test.state.reset(client, {
    blockNumber: 23_093_073n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
  await setVitalikResolver(client)
})

test('gets primary name for address', async () => {
  await expect(
    getName(client, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    }),
  ).resolves.toMatchInlineSnapshot(`"awkweb.eth"`)
})

test('behavior: address without primary name', async () => {
  await expect(
    getName(client, {
      address: '0x00000000000000000000000000000000000c0ffe',
    }),
  ).resolves.toBeNull()
})

test('args: coinType (ENSIP-19 default reverse)', async () => {
  await expect(
    getName(client, {
      address: '0x69420f05A11f617B4B74fFe2E04B2D300dFA556F',
      coinType: 2147483648n,
    }),
  ).resolves.toMatchInlineSnapshot(`"ilikelasagna.eth"`)
})

test('args: universalResolverAddress', async () => {
  await expect(
    getName(client, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
      universalResolverAddress: '0xED73a03F19e8D849E44a39252d222c6ad5217E1e',
    }),
  ).resolves.toMatchInlineSnapshot(`"awkweb.eth"`)
})

test('behavior: primary name without resolver', async () => {
  await expect(
    getName(client, {
      address: '0x00000000000061aD8EE190710508A818aE5325C3',
    }),
  ).resolves.toBeNull()
})

test('behavior: primary name without resolver (strict)', async () => {
  await expect(
    getName(client, {
      address: '0x00000000000061aD8EE190710508A818aE5325C3',
      strict: true,
    }),
  ).rejects.toThrowError('reverted')
})

test('behavior: reverse record mismatch', async () => {
  await expect(
    getName(client, {
      address: '0xe756236ef7FD64Ebbb360465C621c7dB5a336F4d',
    }),
  ).resolves.toBeNull()
})

test('behavior: chainless client requires universalResolverAddress', async () => {
  const chainless = Client.create({
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  await expect(
    getName(chainless, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
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
    getName(scoped, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    }),
  ).rejects.toThrowError('does not support contract "ensUniversalResolver"')
})

test('behavior: universalResolver deployed after blockNumber', async () => {
  await expect(
    getName(client, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
      blockNumber: 14_353_601n,
    }),
  ).rejects.toThrowError(
    'was not deployed until block 23085558 (current block 14353601)',
  )
})

test('behavior: invalid universalResolverAddress', async () => {
  await expect(
    getName(client, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
      universalResolverAddress: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    }),
  ).rejects.toThrowError()
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  await expect(
    decorated.ens.getName({
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    }),
  ).resolves.toMatchInlineSnapshot(`"awkweb.eth"`)
})

describe('behavior: primary name with resolver without text support', () => {
  beforeAll(async () => {
    await setPrimaryName(client, { name: 'vitalik.eth' })
  })

  test('non-strict', async () => {
    await expect(getName(client, { address: vitalik })).resolves.toBeNull()
  })

  test('strict', async () => {
    await expect(
      getName(client, { address: vitalik, strict: true }),
    ).rejects.toThrowError('reverted')
  })
})

describe('behavior: primary name with non-contract resolver', () => {
  beforeAll(async () => {
    await setPrimaryName(client, { name: 'vbuterin.eth' })
  })

  test('non-strict', async () => {
    await expect(getName(client, { address: vitalik })).resolves.toBeNull()
  })

  test('strict', async () => {
    await expect(
      getName(client, { address: vitalik, strict: true }),
    ).rejects.toThrowError('reverted')
  })
})

describe('behavior: batch gateway http error', () => {
  beforeAll(async () => {
    await setPrimaryName(client, { name: '1.offchainexample.eth' })
  })

  test('non-strict', async () => {
    const server = await createBatchGatewayErrorServer()
    await expect(
      getName(ccipClient, { address: vitalik, gatewayUrls: [server.url] }),
    ).resolves.toBeNull()
    await server.close()
  })

  test('strict', async () => {
    const server = await createBatchGatewayErrorServer()
    await expect(
      getName(ccipClient, {
        address: vitalik,
        gatewayUrls: [server.url],
        strict: true,
      }),
    ).rejects.toThrowError('HttpError')
    await server.close()
  })
})
