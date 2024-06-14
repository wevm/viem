import { describe, expect, test, vi } from 'vitest'

import { createHttpServer } from '~test/src/utils.js'

import { anvilMainnet } from '../../../../test/src/anvil.js'

import {
  getGateway,
  getJsonImage,
  getMetadataAvatarUri,
  getNftTokenUri,
  isImageUri,
  parseAvatarUri,
  parseNftUri,
  resolveAvatarUri,
} from './utils.js'

const client = anvilMainnet.getClient()

describe('isImageUri', () => {
  test('is image', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'image/png',
      })
      res.end()
    })

    await expect(isImageUri(server.url)).resolves.toBe(true)
  })

  test('is not image', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
      })
      res.end()
    })

    await expect(isImageUri(server.url)).resolves.toBe(false)
  })

  test('no content', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(204)
      res.end()
    })

    await expect(isImageUri(server.url)).resolves.toBe(false)
  })

  test('non-cors error', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(500)
      res.destroy()
    })

    await expect(isImageUri(server.url)).resolves.toBe(false)
  })

  test('cors error, no image in global', async () => {
    vi.stubGlobal('fetch', () => {
      throw { response: undefined }
    })

    await expect(isImageUri('http://123')).resolves.toBe(false)

    vi.unstubAllGlobals()
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

    await expect(isImageUri('http://123')).resolves.toBe(true)

    vi.unstubAllGlobals()
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

    await expect(isImageUri('http://123')).resolves.toBe(false)

    vi.unstubAllGlobals()
  })

  test('cors error, defined response', async () => {
    vi.stubGlobal('fetch', () => {
      throw { response: 'abc' }
    })

    await expect(isImageUri('http://123')).resolves.toBe(false)

    vi.unstubAllGlobals()
  })
})

describe('getGateway', () => {
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

describe('resolveAvatarUri()', () => {
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
  ])('ipfs: resolveAvatarUri($uri) -> $expected', ({ uri, expected }) => {
    expect(resolveAvatarUri({ uri })).toStrictEqual({
      uri: expected,
      isOnChain: false,
      isEncoded: false,
    })
  })

  test('ipfs custom gateway', () => {
    expect(
      resolveAvatarUri({
        uri: 'ipfs://ipfs/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
        gatewayUrls: { ipfs: 'https://example.com' },
      }),
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
  ])('arweave: resolveAvatarUri($uri) -> $expected', ({ uri, expected }) => {
    expect(resolveAvatarUri({ uri })).toStrictEqual({
      uri: expected,
      isOnChain: false,
      isEncoded: false,
    })
  })

  test('arweave custom gateway', () => {
    expect(
      resolveAvatarUri({
        uri: 'ar://rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI',
        gatewayUrls: {
          arweave: 'https://example.com',
        },
      }),
    ).toStrictEqual({
      uri: 'https://example.com/rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI',
      isOnChain: false,
      isEncoded: false,
    })
  })

  test('arweave replace default', () => {
    expect(
      resolveAvatarUri({
        uri: 'https://arweave.net/rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI',
        gatewayUrls: { arweave: 'https://example.com' },
      }),
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
        uri: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
        isOnChain: true,
        isEncoded: false,
      },
    },
  ])(
    'http/data: resolveAvatarUri($uri) -> onchain: $expected.isOnChain, encoded: $expected.isEncoded, $expected.uri',
    ({ uri, expected }) => {
      expect(resolveAvatarUri({ uri })).toStrictEqual(expected)
    },
  )

  test('invalid uri', () => {
    expect(() =>
      resolveAvatarUri({ uri: 'invalid' }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarUriResolutionError: Unable to resolve ENS avatar URI "invalid". The URI may be malformed, invalid, or does not respond with a valid image.

      Version: viem@x.y.z]
    `)
  })

  test('empty uri', () => {
    expect(() =>
      resolveAvatarUri({ uri: '' }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarUriResolutionError: Unable to resolve ENS avatar URI "". The URI may be malformed, invalid, or does not respond with a valid image.

      Version: viem@x.y.z]
    `)
  })
})

describe('getJsonImage', () => {
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
    expect(() =>
      getJsonImage({ other: 'test' }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarInvalidMetadataError: Unable to extract image from metadata. The metadata may be malformed or invalid.

      - Metadata must be a JSON object with at least an \`image\`, \`image_url\` or \`image_data\` property.

      Provided data: {"other":"test"}

      Version: viem@x.y.z]
    `)
  })

  test('not an object', () => {
    expect(() => getJsonImage('test')).toThrowErrorMatchingInlineSnapshot(
      `
      [EnsAvatarInvalidMetadataError: Unable to extract image from metadata. The metadata may be malformed or invalid.

      - Metadata must be a JSON object with at least an \`image\`, \`image_url\` or \`image_data\` property.

      Provided data: "test"

      Version: viem@x.y.z]
    `,
    )
  })
})

describe('getMetadataAvatarUri', () => {
  test('default', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          image:
            'https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg',
        }),
      )
    })

    await expect(getMetadataAvatarUri({ uri: server.url })).resolves.toEqual(
      'https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg',
    )
  })

  test('error: invalid uri', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/html',
      })
      res.end(
        '<html><head><title>Test</title></head><body><h1>Test</h1></body></html>',
      )
    })

    await expect(() =>
      getMetadataAvatarUri({ uri: server.url }),
    ).rejects.toThrowError('Unable to resolve ENS avatar URI')
  })
})

describe('parseAvatarUri', () => {
  test('onchain', async () => {
    await expect(
      parseAvatarUri({ uri: 'data:image/gif;base64,test' }),
    ).resolves.toEqual('data:image/gif;base64,test')
  })

  test('image', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'image/png',
      })
      res.end()
    })

    await expect(parseAvatarUri({ uri: server.url })).resolves.toEqual(
      server.url,
    )
  })

  test('error: invalid uri', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ image: 'test' }))
    })

    await expect(() =>
      parseAvatarUri({ uri: server.url }),
    ).rejects.toThrowError('Unable to resolve ENS avatar URI')
  })
})

describe('parseNftUri', () => {
  test('erc721', () => {
    expect(parseNftUri('eip155:1/erc721:0x123/1')).toEqual({
      chainID: 1,
      namespace: 'erc721',
      contractAddress: '0x123',
      tokenID: '1',
    })
  })

  test('erc1155', () => {
    expect(parseNftUri('eip155:1/erc1155:0x123/1')).toEqual({
      chainID: 1,
      namespace: 'erc1155',
      contractAddress: '0x123',
      tokenID: '1',
    })
  })

  test('parse DID NFT URI', () => {
    expect(parseNftUri('did:nft:eip155:1_erc721:0x123_1')).toEqual({
      chainID: 1,
      namespace: 'erc721',
      contractAddress: '0x123',
      tokenID: '1',
    })
  })

  test('invalid DID NFT URI', () => {
    expect(() => parseNftUri('did:nft:eip155:1_erc721:0x123')).toThrowError(
      'Token ID not found',
    )
  })

  test('invalid eip namespace', () => {
    expect(() => parseNftUri('eip156:1/erc721:0x123/1')).toThrowError(
      'Only EIP-155 supported',
    )
  })

  test('uppercase eip namespace', () => {
    expect(parseNftUri('EIP155:1/erc721:0x123/1')).toEqual({
      chainID: 1,
      namespace: 'erc721',
      contractAddress: '0x123',
      tokenID: '1',
    })
  })

  test('no chain id', () => {
    expect(() => parseNftUri('eip155:/erc721:0x123/1')).toThrowError(
      'Chain ID not found',
    )
  })
  test('no contract address', () => {
    expect(() => parseNftUri('eip155:1/erc721:/1')).toThrowError(
      'Contract address not found',
    )
  })

  test('no token id', () => {
    expect(() => parseNftUri('eip155:1/erc721:0x123/')).toThrowError(
      'Token ID not found',
    )
  })

  test('no erc namespace', () => {
    expect(() => parseNftUri('eip155:1/:0x123/1')).toThrowError(
      'ERC namespace not found',
    )
  })
})

describe('getNftTokenUri', () => {
  test('erc721', async () => {
    await expect(
      getNftTokenUri(client, {
        nft: {
          chainID: 1,
          contractAddress: '0x8ec9c306d203fe7e2fa596d1b19790a9db05ccd2',
          tokenID: '2257',
          namespace: 'erc721',
        },
      }),
    ).resolves.toMatchInlineSnapshot(
      `"https://creature.mypinata.cloud/ipfs/QmZ5gZzY3zt5c1WEeLVXxtGB6rfaJSFJMWL5MiTFUkAa1b/2257"`,
    )
  })
  test('erc1155', async () => {
    await expect(
      getNftTokenUri(client, {
        nft: {
          chainID: 1,
          contractAddress: '0x495f947276749Ce646f68AC8c248420045cb7b5e',
          tokenID:
            '8112316025873927737505937898915153732580103913704334048512380490797008551937',
          namespace: 'erc1155',
        },
      }),
    ).resolves.toMatchInlineSnapshot(
      '"https://api.opensea.io/api/v1/metadata/0x495f947276749Ce646f68AC8c248420045cb7b5e/0x{id}"',
    )
  })
  test('other', async () => {
    await expect(() =>
      getNftTokenUri(client, {
        nft: {
          chainID: 1,
          contractAddress: '0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6',
          tokenID: '1',
          namespace: 'erc1',
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [EnsAvatarUnsupportedNamespaceError: ENS NFT avatar namespace "erc1" is not supported. Must be "erc721" or "erc1155".

      Version: viem@x.y.z]
    `,
    )
  })
})
