import { describe, expect, MockedFunction, test, vi } from 'vitest'
import { getAvatarMetadata } from './getAvatarMetadata'
import { fetchNftTokenUri, fetchOffchainData } from './utils'

const mockFetchNftTokenUri = fetchNftTokenUri as MockedFunction<
  typeof fetchNftTokenUri
>
const mockFetchOffchainData = fetchOffchainData as MockedFunction<
  typeof fetchOffchainData
>

vi.mock('./utils', async () => {
  const actual = await vi.importActual<object>('./utils')
  return {
    ...actual,
    parseOnChainUri: vi.fn((...args) => args),
    fetchNftTokenUri: vi.fn(),
    fetchOffchainData: vi.fn(),
  }
})

describe('getAvatarMetadata()', () => {
  test('onchain uri', async () => {
    await expect(
      getAvatarMetadata({} as any, 'test', undefined),
    ).resolves.toEqual(['test', undefined])
  })

  test('nft onchain uri', async () => {
    mockFetchNftTokenUri.mockResolvedValue(
      '{"image":"data:image/svg+xml;utf8,<svg></svg>"}',
    )
    await expect(
      getAvatarMetadata({} as any, 'eip155:1/erc721:0x123/1', undefined),
    ).resolves.toEqual({
      type: 'nft',
      uri: 'data:image/svg+xml;utf8,<svg></svg>',
    })
  })

  test('nft onchain encoded uri', async () => {
    mockFetchNftTokenUri.mockResolvedValue(
      'data:application/json;base64,ewogICAgImltYWdlIjogImVuY29kZWQtZGF0YSIKfQ==',
    )
    await expect(
      getAvatarMetadata({} as any, 'eip155:1/erc721:0x123/1', undefined),
    ).resolves.toEqual({
      type: 'nft',
      uri: 'encoded-data',
    })
  })

  test('nft offchain erc721 uri', async () => {
    mockFetchNftTokenUri.mockResolvedValue('https://test.com/0x{id}')
    mockFetchOffchainData.mockImplementation(async (uri) => ({
      type: 'nft',
      uri,
    }))
    await expect(
      getAvatarMetadata({} as any, 'eip155:1/erc721:0x123/1', undefined),
    ).resolves.toEqual({
      type: 'nft',
      uri: 'https://test.com/1',
    })
  })

  test('nft offchain no 0x uri', async () => {
    mockFetchNftTokenUri.mockResolvedValue('https://test.com/{id}')
    mockFetchOffchainData.mockImplementation(async (uri) => ({
      type: 'nft',
      uri,
    }))
    await expect(
      getAvatarMetadata({} as any, 'eip155:1/erc721:0x123/1', undefined),
    ).resolves.toEqual({
      type: 'nft',
      uri: 'https://test.com/1',
    })
  })

  test('nft offchain erc1155 uri', async () => {
    mockFetchNftTokenUri.mockResolvedValue('https://test.com/0x{id}')
    mockFetchOffchainData.mockImplementation(async (uri) => ({
      type: 'nft',
      uri,
    }))
    await expect(
      getAvatarMetadata({} as any, 'eip155:1/erc1155:0x123/1', undefined),
    ).resolves.toEqual({
      type: 'nft',
      uri: 'https://test.com/0000000000000000000000000000000000000000000000000000000000000001',
    })
  })
})
