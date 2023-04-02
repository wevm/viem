import { describe, expect, test, vi } from 'vitest'
import { createHttpServer, publicClient } from '../../../_test'
import {
  fetchNftTokenUri,
  fetchOffchainData,
  getGateway,
  getJsonImage,
  isImageURI,
  parseNFT,
  parseOnChainUri,
  resolveAvatarURI,
} from './utils'

describe('isImageURI()', () => {
  test('is image', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'image/png',
      })
      res.end()
    })

    await expect(isImageURI(server.url)).resolves.toBe(true)
  })
  test('is not image', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
      })
      res.end()
    })

    await expect(isImageURI(server.url)).resolves.toBe(false)
  })
  test('non-cors error', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(500)
      res.destroy()
    })

    await expect(isImageURI(server.url)).resolves.toBe(false)
  })
  test('cors error, no image in global', async () => {
    vi.stubGlobal('fetch', () => {
      throw { response: undefined }
    })

    await expect(isImageURI('http://123')).resolves.toBe(false)
  })
  test('cors error, image loads', async () => {
    vi.stubGlobal('fetch', () => {
      throw { response: undefined }
    })
    vi.stubGlobal(
      'Image',
      class {
        onload = () => {}
        onerror = undefined
        set src(_: string) {
          this.onload()
        }
      },
    )

    await expect(isImageURI('http://123')).resolves.toBe(true)
  })
  test('cors error, image fails to load', async () => {
    vi.stubGlobal('fetch', () => {
      throw { response: undefined }
    })
    vi.stubGlobal(
      'Image',
      class {
        onload = undefined
        onerror = () => {}
        set src(_: string) {
          this.onerror()
        }
      },
    )

    await expect(isImageURI('http://123')).resolves.toBe(false)
  })
})

describe('getGateway()', () => {
  test('no custom', () => {
    expect(getGateway(undefined, 'default')).toBe('default')
  })
  test('custom with slash', () => {
    expect(getGateway('custom/', 'default')).toBe('custom')
  })
  test('custom without slash', () => {
    expect(getGateway('custom', 'default')).toBe('custom')
  })
})

describe('resolveAvatarURI()', () => {
  test.each([
    {
      uri: 'ipfs://ipfs/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
      expected:
        'https://ipfs.io/ipfs/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
    },
    {
      uri: 'ipfs://ipns/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
      expected:
        'https://ipfs.io/ipns/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
    },
    {
      uri: 'bafybeiasb5vpmaounyilfuxbd3lryvosl4yefqrfahsb2esg46q6tu6y5q', // v1 Base32
      expected:
        'https://ipfs.io/ipfs/bafybeiasb5vpmaounyilfuxbd3lryvosl4yefqrfahsb2esg46q6tu6y5q',
    },
    {
      uri: 'zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7', // v1 Base58btc
      expected:
        'https://ipfs.io/ipfs/zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7',
    },
    {
      uri: 'zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7/test.json', // v1 Base58btc
      expected:
        'https://ipfs.io/ipfs/zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7/test.json',
    },
    {
      uri: 'ipfs://QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB/1.json',
      expected:
        'https://ipfs.io/ipfs/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB/1.json',
    },
    {
      uri: 'ipns://QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
      expected:
        'https://ipfs.io/ipns/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
    },
    {
      uri: '/ipfs/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB/1.json',
      expected:
        'https://ipfs.io/ipfs/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB/1.json',
    },
    {
      uri: '/ipns/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
      expected:
        'https://ipfs.io/ipns/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
    },
    {
      uri: 'ipfs/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
      expected:
        'https://ipfs.io/ipfs/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
    },
    {
      uri: 'ipns/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB/1.json',
      expected:
        'https://ipfs.io/ipns/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB/1.json',
    },
    {
      uri: 'ipns/ipns.com',
      expected: 'https://ipfs.io/ipns/ipns.com',
    },
    {
      uri: '/ipns/github.com',
      expected: 'https://ipfs.io/ipns/github.com',
    },
    {
      uri: 'https://rainbow.pinata.cloud/ipfs/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
      expected:
        'https://ipfs.io/ipfs/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
    },
  ])('ipfs: resolveAvatarURI($uri) -> $expected', ({ uri, expected }) => {
    expect(resolveAvatarURI(uri, undefined)).toStrictEqual({
      uri: expected,
      isOnChain: false,
      isEncoded: false,
    })
  })

  test('ipfs custom gateway', () => {
    expect(
      resolveAvatarURI(
        'ipfs://ipfs/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
        { ipfs: 'https://example.com' },
      ),
    ).toStrictEqual({
      uri: 'https://example.com/ipfs/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
      isOnChain: false,
      isEncoded: false,
    })
  })

  test.each([
    {
      uri: 'ar://rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI',
      expected:
        'https://arweave.net/rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI',
    },
    {
      uri: 'ar://rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI/1',
      expected:
        'https://arweave.net/rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI/1',
    },
    {
      uri: 'ar://rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI/1.json',
      expected:
        'https://arweave.net/rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI/1.json',
    },
    {
      uri: 'ar://tnLgkAg70wsn9fSr1sxJKG_qcka1gJtmUwXm_3_lDaI/1.png',
      expected:
        'https://arweave.net/tnLgkAg70wsn9fSr1sxJKG_qcka1gJtmUwXm_3_lDaI/1.png',
    },
  ])('arweave: resolveAvatarURI($uri) -> $expected', ({ uri, expected }) => {
    expect(resolveAvatarURI(uri, undefined)).toStrictEqual({
      uri: expected,
      isOnChain: false,
      isEncoded: false,
    })
  })

  test('arweave custom gateway', () => {
    expect(
      resolveAvatarURI('ar://rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI', {
        arweave: 'https://example.com',
      }),
    ).toStrictEqual({
      uri: 'https://example.com/rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI',
      isOnChain: false,
      isEncoded: false,
    })
  })

  test('arweave replace default', () => {
    expect(
      resolveAvatarURI(
        'https://arweave.net/rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI',
        { arweave: 'https://example.com' },
      ),
    ).toStrictEqual({
      uri: 'https://example.com/rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI',
      isOnChain: false,
      isEncoded: false,
    })
  })

  test.each([
    {
      uri: 'https://i.imgur.com/yed5Zfk.gif',
      expected: {
        uri: 'https://i.imgur.com/yed5Zfk.gif',
        isOnChain: false,
        isEncoded: false,
      },
    },
    {
      uri: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
      expected: {
        uri: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
        isOnChain: true,
        isEncoded: true,
      },
    },
    {
      uri: 'http://i.imgur.com/yed5Zfk.gif',
      expected: {
        uri: 'http://i.imgur.com/yed5Zfk.gif',
        isOnChain: false,
        isEncoded: false,
      },
    },
    {
      uri: 'data:image/svg+xml;utf8,<svg></svg>',
      expected: {
        uri: '<svg></svg>',
        isOnChain: true,
        isEncoded: false,
      },
    },
  ])(
    'http/data: resolveAvatarURI($uri) -> onchain: $expected.isOnChain, encoded: $expected.isEncoded, $expected.uri',
    ({ uri, expected }) => {
      expect(resolveAvatarURI(uri, undefined)).toStrictEqual(expected)
    },
  )
})

describe('getJsonImage()', () => {
  test('image', () => {
    expect(getJsonImage({ image: 'test' })).toBe('test')
  })
  test('image_url', () => {
    expect(getJsonImage({ image_url: 'test' })).toBe('test')
  })
  test('image_data', () => {
    expect(getJsonImage({ image_data: 'test' })).toBe('test')
  })
  test('other property', () => {
    expect(() => getJsonImage({ other: 'test' })).toThrowError(
      'Invalid avatar data',
    )
  })
  test('not an object', () => {
    expect(() => getJsonImage('test')).toThrowError('Invalid avatar data')
  })
})

describe('fetchOffchainData()', () => {
  test('default', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ image: 'test' }))
    })

    await expect(fetchOffchainData(server.url)).resolves.toEqual({
      type: 'image',
      uri: 'test',
    })
  })
})

describe('parseOnChainUri()', () => {
  test('onchain', async () => {
    await expect(
      parseOnChainUri('data:image/gif;base64,test', undefined),
    ).resolves.toEqual({
      type: 'onchain',
      uri: 'data:image/gif;base64,test',
    })
  })
  test('image', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'image/png',
      })
      res.end()
    })

    await expect(parseOnChainUri(server.url, undefined)).resolves.toEqual({
      type: 'image',
      uri: server.url,
    })
  })
  test('other', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ image: 'test' }))
    })

    await expect(parseOnChainUri(server.url, undefined)).resolves.toEqual({
      type: 'image',
      uri: 'test',
    })
  })

  test('gateways', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ image: 'test' }))
    })

    await expect(
      parseOnChainUri('ipfs://QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB', {
        ipfs: server.url,
      }),
    ).resolves.toEqual({
      type: 'image',
      uri: 'test',
    })
  })
})

describe('parseNFT()', () => {
  test('erc721', () => {
    expect(parseNFT('eip155:1/erc721:0x123/1')).toEqual({
      chainID: 1,
      namespace: 'erc721',
      contractAddress: '0x123',
      tokenID: '1',
    })
  })
  test('erc1155', () => {
    expect(parseNFT('eip155:1/erc1155:0x123/1')).toEqual({
      chainID: 1,
      namespace: 'erc1155',
      contractAddress: '0x123',
      tokenID: '1',
    })
  })
  test('parse DID NFT URI', () => {
    expect(parseNFT('did:nft:eip155:1_erc721:0x123_1')).toEqual({
      chainID: 1,
      namespace: 'erc721',
      contractAddress: '0x123',
      tokenID: '1',
    })
  })
  test('invalid DID NFT URI', () => {
    expect(() => parseNFT('did:nft:eip155:1_erc721:0x123')).toThrowError(
      'Error parsing NFT URI: Token ID not found',
    )
  })
  test('invalid eip namespace', () => {
    expect(() => parseNFT('eip156:1/erc721:0x123/1')).toThrowError(
      'Error parsing NFT URI: Only EIP-155 supported',
    )
  })
  test('uppercase eip namespace', () => {
    expect(parseNFT('EIP155:1/erc721:0x123/1')).toEqual({
      chainID: 1,
      namespace: 'erc721',
      contractAddress: '0x123',
      tokenID: '1',
    })
  })
  test('no chain id', () => {
    expect(() => parseNFT('eip155:/erc721:0x123/1')).toThrowError(
      'Error parsing NFT URI: Chain ID not found',
    )
  })
  test('no contract address', () => {
    expect(() => parseNFT('eip155:1/erc721:/1')).toThrowError(
      'Error parsing NFT URI: Contract address not found',
    )
  })
  test('no token id', () => {
    expect(() => parseNFT('eip155:1/erc721:0x123/')).toThrowError(
      'Error parsing NFT URI: Token ID not found',
    )
  })
  test('no erc namespace', () => {
    expect(() => parseNFT('eip155:1/:0x123/1')).toThrowError(
      'Error parsing NFT URI: ERC namespace not found',
    )
  })
})

describe('fetchNftTokenUri()', () => {
  test('erc721', async () => {
    await expect(
      fetchNftTokenUri(publicClient, {
        chainID: 1,
        contractAddress: '0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6',
        tokenID: '7816',
        namespace: 'erc721',
      }),
    ).resolves.toMatchInlineSnapshot(
      '"https://wrappedpunks.com:3000/api/punks/metadata/7816"',
    )
  })
  test('erc1155', async () => {
    await expect(
      fetchNftTokenUri(publicClient, {
        chainID: 1,
        contractAddress: '0x495f947276749Ce646f68AC8c248420045cb7b5e',
        tokenID:
          '8112316025873927737505937898915153732580103913704334048512380490797008551937',
        namespace: 'erc1155',
      }),
    ).resolves.toMatchInlineSnapshot(
      '"https://api.opensea.io/api/v1/metadata/0x495f947276749Ce646f68AC8c248420045cb7b5e/0x{id}"',
    )
  })
  test('other', async () => {
    await expect(() =>
      fetchNftTokenUri(publicClient, {
        chainID: 1,
        contractAddress: '0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6',
        tokenID: '1',
        namespace: 'erc1',
      }),
    ).rejects.toThrowError('Only ERC721 and ERC1155 supported')
  })
})
