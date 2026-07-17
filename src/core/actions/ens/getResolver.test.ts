import { Ens } from 'ox'
import * as anvil from '~test/anvil.js'
import { afterAll, beforeAll, expect, test } from 'vitest'

import { Actions, Client, http, publicActions } from 'viem'
import { linea, mainnet, optimism } from 'viem/chains'

import { getResolver } from './getResolver.js'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})

beforeAll(async () => {
  await Actions.state.reset(client, {
    blockNumber: 23_085_558n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
})

// Instances are shared across test files; restore the default fork.
afterAll(async () => {
  await Actions.state.reset(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 30_000)

test('gets resolver for name', async () => {
  await expect(
    getResolver(client, { name: Ens.normalize('jxom.eth') }),
  ).resolves.toMatchInlineSnapshot(
    `"0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"`,
  )
  await expect(
    getResolver(client, { name: Ens.normalize('test.eth') }),
  ).resolves.toMatchInlineSnapshot(
    `"0x226159d592E2b063810a10Ebf6dcbADA94Ed68b8"`,
  )
})

test('args: universalResolverAddress', async () => {
  await expect(
    getResolver(client, {
      name: Ens.normalize('awkweb.eth'),
      universalResolverAddress: '0x64969fb44091A7E5fA1213D30D7A7e8488edf693',
    }),
  ).resolves.toMatchInlineSnapshot(
    `"0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"`,
  )
})

test('behavior: chainless client requires universalResolverAddress', async () => {
  const chainless = Client.create({
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  await expect(getResolver(chainless, { name: Ens.normalize('jxom.eth') }))
    .rejects.toThrowErrorMatchingInlineSnapshot(`
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
    getResolver(scoped, { name: Ens.normalize('jxom.eth') }),
  ).rejects.toThrowError('does not support contract "ensUniversalResolver"')
})

test('behavior: universalResolver deployed after blockNumber', async () => {
  await expect(
    getResolver(client, {
      blockNumber: 14_353_601n,
      name: Ens.normalize('jxom.eth'),
    }),
  ).rejects.toThrowError(
    'was not deployed until block 23085558 (current block 14353601)',
  )
})

test('behavior: invalid universalResolverAddress', async () => {
  await expect(
    getResolver(client, {
      name: Ens.normalize('jxom.eth'),
      universalResolverAddress: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    }),
  ).rejects.toThrowError()
})

test('behavior: invalid chain TLD', async () => {
  const scoped = Client.create({
    chain: linea,
    transport: http(anvil.mainnet.rpcUrl.http),
  })

  await expect(getResolver(scoped, { name: Ens.normalize('vitalik.eth') }))
    .rejects.toThrowErrorMatchingInlineSnapshot(`
    [BaseError: vitalik.eth is not a valid ENS TLD (.linea.eth) for chain "Linea Mainnet" (id: 59144).

    Version: viem@2.52.1]
  `)
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  await expect(
    decorated.ens.getResolver({ name: Ens.normalize('jxom.eth') }),
  ).resolves.toMatchInlineSnapshot(
    `"0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"`,
  )
})
