import {
  ChainNotConfiguredError,
  createClientResolver,
  http,
  TransportNotConfiguredError,
} from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { expect, test } from 'vitest'

test('resolves and caches a distinct client for each chain', () => {
  const resolver = createClientResolver({
    chains: [mainnet, optimism],
    transport: {
      [mainnet.id]: http('https://mainnet.example'),
      [optimism.id]: http('https://optimism.example'),
    },
  })
  const client = resolver.getClient({ chainId: optimism.id })
  expect(client.chain).toBe(optimism)
  expect(client.transport.url).toMatchInlineSnapshot(
    '"https://optimism.example"',
  )
  const other = resolver.getClient({ chainId: mainnet.id })
  expect(other.chain).toBe(mainnet)
  expect(other.transport.url).toMatchInlineSnapshot('"https://mainnet.example"')
  expect(resolver.getClient({ chainId: optimism.id })).toBe(client)
  expect(resolver.getClient({ chainId: mainnet.id })).toBe(other)
  expect(client).not.toBe(other)
})

test('resolves a callback lazily and reuses its cached client', () => {
  let url = 'https://first.example'
  const resolver = createClientResolver({
    chains: [mainnet, optimism],
    transport: ({ chainId }) => {
      if (chainId === mainnet.id) throw new Error('unavailable')
      return http(`${url}/${chainId}`)
    },
  })
  const client = resolver.getClient({ chainId: optimism.id })
  expect(client.transport.url).toMatchInlineSnapshot(
    '"https://first.example/10"',
  )
  url = 'https://second.example'
  expect(resolver.getClient({ chainId: optimism.id })).toBe(client)
  expect(() =>
    resolver.getClient({ chainId: mainnet.id }),
  ).toThrowErrorMatchingInlineSnapshot('[Error: unavailable]')
})

test('applies shared client options', () => {
  const resolver = createClientResolver({
    account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    batch: { multicall: true },
    cacheTime: 123,
    ccipRead: false,
    chains: [mainnet, optimism],
    dataSuffix: '0xabcd',
    experimental_blockTag: 'safe',
    key: 'resolved',
    name: 'Resolved Client',
    pollingInterval: 1_234,
    tokens: [],
    transport: ({ chainId }) => http(`https://${chainId}.example`),
    type: 'resolved',
  })
  const { uid: _, ...client } = resolver.getClient({ chainId: optimism.id })
  expect(client).toMatchInlineSnapshot(`
    {
      "account": {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "type": "json-rpc",
      },
      "batch": {
        "multicall": true,
      },
      "cacheTime": 123,
      "ccipRead": false,
      "chain": {
        "blockExplorers": {
          "default": {
            "apiUrl": "https://api-optimistic.etherscan.io/api",
            "name": "Optimism Explorer",
            "url": "https://optimistic.etherscan.io",
          },
        },
        "blockTime": 2000,
        "contracts": {
          "disputeGameFactory": {
            "1": {
              "address": "0xe5965Ab5962eDc7477C8520243A95517CD252fA9",
            },
          },
          "gasPriceOracle": {
            "address": "0x420000000000000000000000000000000000000F",
          },
          "l1Block": {
            "address": "0x4200000000000000000000000000000000000015",
          },
          "l1StandardBridge": {
            "1": {
              "address": "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
            },
          },
          "l2CrossDomainMessenger": {
            "address": "0x4200000000000000000000000000000000000007",
          },
          "l2Erc721Bridge": {
            "address": "0x4200000000000000000000000000000000000014",
          },
          "l2OutputOracle": {
            "1": {
              "address": "0xdfe97868233d1aa22e815a266982f2cf17685a27",
            },
          },
          "l2StandardBridge": {
            "address": "0x4200000000000000000000000000000000000010",
          },
          "l2ToL1MessagePasser": {
            "address": "0x4200000000000000000000000000000000000016",
          },
          "multicall3": {
            "address": "0xca11bde05977b3631167028862be2a173976ca11",
            "blockCreated": 4286263,
          },
          "portal": {
            "1": {
              "address": "0xbEb5Fc579115071764c7423A4f12eDde41f106Ed",
            },
          },
        },
        "extend": [Function],
        "fees": undefined,
        "formatters": {
          "block": {
            "exclude": undefined,
            "format": [Function],
            "type": "block",
          },
          "transaction": {
            "exclude": undefined,
            "format": [Function],
            "type": "transaction",
          },
          "transactionReceipt": {
            "exclude": undefined,
            "format": [Function],
            "type": "transactionReceipt",
          },
        },
        "id": 10,
        "name": "OP Mainnet",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Ether",
          "symbol": "ETH",
        },
        "rpcUrls": {
          "default": {
            "http": [
              "https://mainnet.optimism.io",
            ],
          },
        },
        "serializers": {
          "transaction": [Function],
        },
        "sourceId": 1,
      },
      "dataSuffix": "0xabcd",
      "experimental_blockTag": "safe",
      "extend": [Function],
      "key": "resolved",
      "name": "Resolved Client",
      "pollingInterval": 1234,
      "request": [Function],
      "tokens": [],
      "transport": {
        "fetchOptions": undefined,
        "key": "http",
        "methods": undefined,
        "name": "HTTP JSON-RPC",
        "request": [Function],
        "retryCount": 3,
        "retryDelay": 150,
        "timeout": 10000,
        "type": "http",
        "url": "https://10.example",
      },
      "type": "resolved",
    }
  `)
  expect(resolver.getClient({ chainId: mainnet.id }).account).toEqual(
    client.account,
  )
})

test('derives defaults separately for each chain', () => {
  const resolver = createClientResolver({
    chains: [mainnet, optimism],
    transport: () => http(),
  })
  expect(
    resolver.getClient({ chainId: mainnet.id }).pollingInterval,
  ).toMatchInlineSnapshot('4000')
  expect(
    resolver.getClient({ chainId: optimism.id }).pollingInterval,
  ).toMatchInlineSnapshot('1000')
})

test('rejects an unconfigured chain before resolving its transport', () => {
  const resolver = createClientResolver({
    chains: [mainnet],
    transport: () => {
      throw new Error('transport unavailable')
    },
  })
  const resolve = () =>
    resolver.getClient({ chainId: 8453 as typeof mainnet.id })
  expect(resolve).toThrow(ChainNotConfiguredError)
  expect(resolve).toThrowErrorMatchingInlineSnapshot(`
    [createClientResolver.ChainNotConfiguredError: Chain with id 8453 is not configured.

    Version: viem@x.y.z]
  `)
})

test('does not cache a failed resolution', () => {
  const transport = { [mainnet.id]: http(), [optimism.id]: http() }
  const resolver = createClientResolver({
    chains: [mainnet, optimism],
    transport,
  })
  Reflect.deleteProperty(transport, optimism.id)
  const resolve = () => resolver.getClient({ chainId: optimism.id })
  expect(resolve).toThrow(TransportNotConfiguredError)
  expect(resolve).toThrowErrorMatchingInlineSnapshot(`
    [createClientResolver.TransportNotConfiguredError: Transport for chain with id 10 is not configured.

    Version: viem@x.y.z]
  `)
  transport[optimism.id] = http('https://recovered.example')
  const client = resolve()
  expect(client.transport.url).toMatchInlineSnapshot(
    '"https://recovered.example"',
  )
  expect(resolve()).toBe(client)
})

test('does not share cached clients between resolvers', () => {
  const a = createClientResolver({
    chains: [mainnet],
    transport: () => http('https://a.example'),
  })
  const b = createClientResolver({
    chains: [mainnet],
    transport: () => http('https://b.example'),
  })
  const client = a.getClient({ chainId: mainnet.id })
  const other = b.getClient({ chainId: mainnet.id })
  expect(client).not.toBe(other)
  expect(other.transport.url).toMatchInlineSnapshot('"https://b.example"')
})
