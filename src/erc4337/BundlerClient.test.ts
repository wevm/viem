import { beforeAll, expect, test } from 'vitest'

import { Client as CoreClient, http } from 'viem'

import { bundler, bundler09, prepareEntryPoint09 } from '~test/bundler.js'
import { mainnet } from '../chains/definitions/mainnet.js'
import * as BundlerClient from './BundlerClient.js'

beforeAll(async () => {
  if (process.env.OFFLINE) return
  await prepareEntryPoint09()
}, 60_000)

test('default', async () => {
  const client = BundlerClient.create({
    pollingInterval: 10,
    transport: http(bundler09.rpcUrl.http),
  })

  expect({
    ...client,
    extend: null,
    request: null,
    transport: null,
    uid: null,
  }).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "batch": undefined,
      "cacheTime": 10,
      "ccipRead": {
        "request": [Function],
      },
      "chain": undefined,
      "client": undefined,
      "dataSuffix": undefined,
      "entryPoint": {
        "getSupported": [Function],
      },
      "extend": null,
      "key": "bundler",
      "name": "Bundler Client",
      "paymaster": undefined,
      "paymasterContext": undefined,
      "pollingInterval": 10,
      "request": null,
      "tokens": undefined,
      "transport": null,
      "type": "bundler",
      "uid": null,
      "userOperation": {
        "estimateGas": [Function],
        "get": [Function],
        "getReceipt": [Function],
        "prepare": [Function],
        "send": [Function],
        "waitForReceipt": [Function],
      },
    }
  `)
  expect(await client.entryPoint.getSupported()).toMatchInlineSnapshot(`
    [
      "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108",
      "0x433709009B8330FDa32311DF1C2AFA402eD8D009",
    ]
  `)
})

test('execution Client defaults', () => {
  const executionClient = CoreClient.create({
    chain: mainnet,
    dataSuffix: { value: '0x1234' },
    transport: http(),
  })
  const client = BundlerClient.create({
    client: executionClient,
    transport: http(bundler.rpcUrl.http),
  })

  expect({
    chain: client.chain,
    client: client.client,
    dataSuffix: client.dataSuffix,
  }).toMatchObject({
    chain: mainnet,
    client: executionClient,
    dataSuffix: '0x1234',
  })
})

test('merges User Operation configuration with actions', () => {
  const client = BundlerClient.create({
    transport: http(bundler.rpcUrl.http),
    userOperation: {
      async estimateFeesPerGas() {
        return { maxFeePerGas: 2n, maxPriorityFeePerGas: 1n }
      },
    },
  })

  expect(Object.keys(client.userOperation ?? {}).sort()).toMatchInlineSnapshot(`
    [
      "estimateFeesPerGas",
      "estimateGas",
      "get",
      "getReceipt",
      "prepare",
      "send",
      "waitForReceipt",
    ]
  `)

  const extended = client.extend(() => ({
    userOperation: {
      custom() {
        return 'custom'
      },
    },
  }))

  expect({
    custom: extended.userOperation.custom(),
    keys: Object.keys(extended.userOperation).sort(),
  }).toMatchInlineSnapshot(`
    {
      "custom": "custom",
      "keys": [
        "custom",
        "estimateFeesPerGas",
        "estimateGas",
        "get",
        "getReceipt",
        "prepare",
        "send",
        "waitForReceipt",
      ],
    }
  `)
})
