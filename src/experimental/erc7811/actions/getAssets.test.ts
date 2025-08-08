import { expect, test } from 'vitest'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import { erc7811Actions } from '../decorators/erc7811.js'
import { getAssets } from './getAssets.js'

const client = createClient({
  transport: http('https://base-sepolia-int.rpc.ithaca.xyz'),
}).extend(erc7811Actions())

test('default', async () => {
  const response = await getAssets(client, {
    account: '0x0000000000000000000000000000000000000001',
  })

  // Check structure and types without checking specific balance values
  expect(response).toBeDefined()
  expect(response[0]).toBeDefined()
  expect(Array.isArray(response[0])).toBe(true)

  // Check that aggregated assets exist
  const aggregatedAssets = response[0]
  expect(aggregatedAssets.length).toBeGreaterThan(0)

  // Check native asset structure
  const nativeAsset = aggregatedAssets.find((asset) => asset.type === 'native')
  expect(nativeAsset).toBeDefined()
  expect(typeof nativeAsset?.balance).toBe('bigint')
  expect(Array.isArray(nativeAsset?.chainIds)).toBe(true)

  // Check ERC20 asset structure
  const erc20Assets = aggregatedAssets.filter((asset) => asset.type === 'erc20')
  expect(erc20Assets.length).toBeGreaterThan(0)

  for (const asset of erc20Assets) {
    expect(typeof asset.balance).toBe('bigint')
    expect(typeof asset.address).toBe('string')
    expect(asset.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
    expect(asset.metadata).toBeDefined()
    expect(typeof asset.metadata.name).toBe('string')
    expect(typeof asset.metadata.symbol).toBe('string')
    expect(typeof asset.metadata.decimals).toBe('number')
    expect(Array.isArray(asset.chainIds)).toBe(true)
  }

  // Check chain-specific data exists
  expect(response[84532]).toBeDefined()
  expect(response[11155420]).toBeDefined()
  expect(Array.isArray(response[84532])).toBe(true)
  expect(Array.isArray(response[11155420])).toBe(true)
})

test('args: aggregate (false)', async () => {
  const response = await getAssets(client, {
    account: '0x0000000000000000000000000000000000000000',
    aggregate: false,
  })

  // Check that no aggregation is performed (no key "0")
  expect(response[0]).toBeUndefined()

  // Check chain-specific assets exist
  expect(response[84532]).toBeDefined()
  expect(response[11155420]).toBeDefined()
  expect(Array.isArray(response[84532])).toBe(true)
  expect(Array.isArray(response[11155420])).toBe(true)

  // Check structure of assets in each chain
  const chains = [84532, 11155420]
  for (const chainId of chains) {
    const assets = response[chainId]
    expect(assets.length).toBeGreaterThan(0)

    // Check native asset
    const nativeAsset = assets.find((asset) => asset.type === 'native')
    expect(nativeAsset).toBeDefined()
    expect(typeof nativeAsset?.balance).toBe('bigint')
    expect(nativeAsset?.address).toBeUndefined() // Native assets don't have addresses

    // Check ERC20 assets
    const erc20Assets = assets.filter((asset) => asset.type === 'erc20')
    for (const asset of erc20Assets) {
      expect(typeof asset.balance).toBe('bigint')
      expect(typeof asset.address).toBe('string')
      expect(asset.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
      expect(asset.metadata).toBeDefined()
      expect(typeof asset.metadata.name).toBe('string')
      expect(typeof asset.metadata.symbol).toBe('string')
      expect(typeof asset.metadata.decimals).toBe('number')
    }
  }
})

test('args: aggregate (function)', async () => {
  const response = await getAssets(client, {
    account: '0x0000000000000000000000000000000000000000',
    aggregate: (asset) => JSON.stringify(asset.metadata),
  })

  // Check that aggregation is performed with custom function
  expect(response[0]).toBeDefined()
  expect(Array.isArray(response[0])).toBe(true)

  const aggregatedAssets = response[0]
  expect(aggregatedAssets.length).toBeGreaterThan(0)

  // Check that assets are aggregated by metadata (custom function)
  const nativeAssets = aggregatedAssets.filter(
    (asset) => asset.type === 'native',
  )
  expect(nativeAssets.length).toBe(1) // Should be aggregated into one

  const nativeAsset = nativeAssets[0]
  expect(typeof nativeAsset.balance).toBe('bigint')
  expect(Array.isArray(nativeAsset.chainIds)).toBe(true)
  expect(nativeAsset.chainIds.length).toBeGreaterThan(1) // Multiple chains aggregated

  // Check ERC20 assets are properly aggregated
  const erc20Assets = aggregatedAssets.filter((asset) => asset.type === 'erc20')
  for (const asset of erc20Assets) {
    expect(typeof asset.balance).toBe('bigint')
    expect(typeof asset.address).toBe('string')
    expect(asset.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
    expect(Array.isArray(asset.chainIds)).toBe(true)
    expect(asset.metadata).toBeDefined()
    expect(typeof asset.metadata.name).toBe('string')
    expect(typeof asset.metadata.symbol).toBe('string')
    expect(typeof asset.metadata.decimals).toBe('number')
  }

  // Check chain-specific data still exists
  expect(response[84532]).toBeDefined()
  expect(response[11155420]).toBeDefined()
})

test('args: chainIds', async () => {
  const response = await getAssets(client, {
    account: '0x0000000000000000000000000000000000000000',
    chainIds: [84532],
  })

  // Check that only the specified chain is returned
  expect(response[84532]).toBeDefined()
  expect(response[11155420]).toBeUndefined() // Should not exist since not requested

  // Check aggregated data exists
  expect(response[0]).toBeDefined()
  expect(Array.isArray(response[0])).toBe(true)

  const aggregatedAssets = response[0]
  expect(aggregatedAssets.length).toBeGreaterThan(0)

  // All aggregated assets should only have chainIds containing 84532
  for (const asset of aggregatedAssets) {
    expect(typeof asset.balance).toBe('bigint')
    expect(Array.isArray(asset.chainIds)).toBe(true)
    expect(asset.chainIds).toEqual([84532])

    if (asset.type === 'erc20') {
      expect(typeof asset.address).toBe('string')
      expect(asset.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
      expect(asset.metadata).toBeDefined()
      expect(typeof asset.metadata.name).toBe('string')
      expect(typeof asset.metadata.symbol).toBe('string')
      expect(typeof asset.metadata.decimals).toBe('number')
    }
  }

  // Check chain-specific data structure
  const chainAssets = response[84532]
  expect(Array.isArray(chainAssets)).toBe(true)
  expect(chainAssets.length).toBeGreaterThan(0)

  const nativeAsset = chainAssets.find((asset) => asset.type === 'native')
  expect(nativeAsset).toBeDefined()
  expect(typeof nativeAsset?.balance).toBe('bigint')
})

test('args: assetTypes', async () => {
  const response = await getAssets(client, {
    account: '0x0000000000000000000000000000000000000000',
    assetTypes: ['native'],
  })

  // Check that only native assets are returned
  expect(response[0]).toBeDefined()
  expect(Array.isArray(response[0])).toBe(true)

  const aggregatedAssets = response[0]
  expect(aggregatedAssets.length).toBe(1) // Only native assets

  const nativeAsset = aggregatedAssets[0]
  expect(nativeAsset.type).toBe('native')
  expect(typeof nativeAsset.balance).toBe('bigint')
  expect(Array.isArray(nativeAsset.chainIds)).toBe(true)
  expect(nativeAsset.chainIds.length).toBeGreaterThan(1) // Multiple chains
  expect(nativeAsset.address).toBeUndefined() // Native assets don't have addresses

  // Check chain-specific data
  expect(response[84532]).toBeDefined()
  expect(response[11155420]).toBeDefined()

  const chains = [84532, 11155420]
  for (const chainId of chains) {
    const chainAssets = response[chainId]
    expect(Array.isArray(chainAssets)).toBe(true)
    expect(chainAssets.length).toBe(1) // Only native asset per chain

    const chainNativeAsset = chainAssets[0]
    expect(chainNativeAsset.type).toBe('native')
    expect(typeof chainNativeAsset.balance).toBe('bigint')
    expect(chainNativeAsset.address).toBeUndefined()
  }
})

test('behavior: erc721 assets with tokenId', async () => {
  const mockClient = createClient({
    transport: http('https://mock.example.com'),
  })
  ;(mockClient.request as any) = async ({ method }: { method: string }) => {
    if (method === 'wallet_getAssets') {
      return {
        '1': [
          {
            address: '0x1234567890123456789012345678901234567890',
            balance: '0x1',
            type: 'erc721',
            metadata: {
              name: 'Test NFT',
              symbol: 'TNFT',
              tokenId: '0x7b', // hex for 123
              tokenUri: 'https://example.com/token/123',
            },
          },
        ],
      }
    }
    throw new Error('Unexpected method')
  }

  const response = await getAssets(mockClient, {
    account: '0x0000000000000000000000000000000000000001',
    aggregate: false,
  })

  expect(response).toMatchInlineSnapshot(`
    {
      "1": [
        {
          "address": "0x1234567890123456789012345678901234567890",
          "balance": 1n,
          "metadata": {
            "name": "Test NFT",
            "symbol": "TNFT",
            "tokenId": 123n,
            "tokenUri": "https://example.com/token/123",
          },
          "type": "erc721",
        },
      ],
    }
  `)
})

test('behavior: custom asset types', async () => {
  const mockClient = createClient({
    transport: http('https://mock.example.com'),
  })

  // Mock the request method to return custom asset types
  ;(mockClient.request as any) = async ({ method }: { method: string }) => {
    if (method === 'wallet_getAssets') {
      return {
        '1': [
          {
            address: '0x1234567890123456789012345678901234567890',
            balance: '0xa',
            type: 'custom-token-type',
            metadata: {
              customProperty: 'customValue',
            },
          },
        ],
      }
    }
    throw new Error('Unexpected method')
  }

  const response = await getAssets(mockClient, {
    account: '0x0000000000000000000000000000000000000001',
    aggregate: false,
  })

  expect(response).toMatchInlineSnapshot(`
    {
      "1": [
        {
          "address": "0x1234567890123456789012345678901234567890",
          "balance": 10n,
          "metadata": {
            "customProperty": "customValue",
          },
          "type": {
            "custom": "custom-token-type",
          },
        },
      ],
    }
  `)
})

test('error: account not found', async () => {
  await expect(() => getAssets(client, {} as any)).rejects.toThrowError(
    AccountNotFoundError,
  )
})
