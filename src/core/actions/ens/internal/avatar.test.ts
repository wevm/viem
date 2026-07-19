import { AbiConstructor } from 'ox'
import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as contract from '~test/contract.js'
import { createServer } from '~test/http.js'
import { describe, expect, test } from 'vitest'

import {
  getJsonImage,
  getMetadataAvatarUri,
  getNftTokenUri,
  parseAvatarUri,
  parseNftUri,
  resolveAvatarUri,
} from './avatar.js'

const local = anvil.getClient(anvil.local)

describe('resolveAvatarUri', () => {
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
      uri: 'bafybeiasb5vpmaounyilfuxbd3lryvosl4yefqrfahsb2esg46q6tu6y5q',
      expected:
        'https://ipfs.io/ipfs/bafybeiasb5vpmaounyilfuxbd3lryvosl4yefqrfahsb2esg46q6tu6y5q',
    },
    {
      uri: 'zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7',
      expected:
        'https://ipfs.io/ipfs/zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7',
    },
    {
      uri: 'zdj7WWeQ43G6JJvLWQWZpyHuAMq6uYWRjkBXFad11vE2LHhQ7/test.json',
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
  ])('ipfs: $uri', ({ uri, expected }) => {
    expect(resolveAvatarUri({ uri })).toStrictEqual({
      uri: expected,
      isOnChain: false,
      isEncoded: false,
    })
  })

  test('ipfs custom gateway', () => {
    expect(
      resolveAvatarUri({
        gatewayUrls: { ipfs: 'https://example.com' },
        uri: 'ipfs://ipfs/QmZHKZDavkvNfA9gSAg7HALv8jF7BJaKjUc9U2LSuvUySB',
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
  ])('arweave: $uri', ({ uri, expected }) => {
    expect(resolveAvatarUri({ uri })).toStrictEqual({
      uri: expected,
      isOnChain: false,
      isEncoded: false,
    })
  })

  test('arweave custom gateway', () => {
    expect(
      resolveAvatarUri({
        gatewayUrls: { arweave: 'https://example.com' },
        uri: 'ar://rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI',
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
        gatewayUrls: { arweave: 'https://example.com' },
        uri: 'https://arweave.net/rgW4h3ffQQzOD8ynnwdl3_YlHxtssqV3aXOregPr7yI',
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
  ])('http/data: $uri', ({ uri, expected }) => {
    expect(resolveAvatarUri({ uri })).toStrictEqual(expected)
  })

  test('error: invalid uri', () => {
    expect(() => resolveAvatarUri({ uri: 'invalid' }))
      .toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarUriResolutionError: Unable to resolve ENS avatar URI "invalid". The URI may be malformed, invalid, or does not respond with a valid image.

      Version: viem@2.52.1]
    `)
  })

  test('error: empty uri', () => {
    expect(() => resolveAvatarUri({ uri: '' }))
      .toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarUriResolutionError: Unable to resolve ENS avatar URI "". The URI may be malformed, invalid, or does not respond with a valid image.

      Version: viem@2.52.1]
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

  test('error: other property', () => {
    expect(() => getJsonImage({ other: 'test' }))
      .toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarInvalidMetadataError: Unable to extract image from metadata. The metadata may be malformed or invalid.

      - Metadata must be a JSON object with at least an \`image\`, \`image_url\` or \`image_data\` property.

      Provided data: {"other":"test"}

      Version: viem@2.52.1]
    `)
  })

  test('error: not an object', () => {
    expect(() => getJsonImage('test')).toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarInvalidMetadataError: Unable to extract image from metadata. The metadata may be malformed or invalid.

      - Metadata must be a JSON object with at least an \`image\`, \`image_url\` or \`image_data\` property.

      Provided data: "test"

      Version: viem@2.52.1]
    `)
  })
})

describe('getMetadataAvatarUri', () => {
  test('default', async () => {
    const server = await createServer((req, res) => {
      if (req.url!.includes('image.png')) {
        res.writeHead(200, { 'Content-Type': 'image/png' })
        res.end()
        return
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ image: `${server.url}/image.png` }))
    })

    // Trusts the local server origin; bare localhost URLs are rejected.
    await expect(
      getMetadataAvatarUri({
        gatewayUrls: { ipfs: server.url },
        uri: server.url,
      }),
    ).resolves.toBe(`${server.url}/image.png`)

    await server.close()
  })

  test.each([
    ['file', 'file:///etc/passwd'],
    ['data', 'data:application/json,{}'],
    ['malformed', 'not a url'],
    ['credentialed', 'https://user:password@example.com/1.json'],
    ['IPv4', 'https://127.0.0.1/1.json'],
    ['IPv4 integer', 'https://2130706433/1.json'],
    ['IPv6', 'https://[::1]/1.json'],
    ['localhost', 'https://localhost/1.json'],
    ['localhost subdomain', 'https://gateway.localhost/1.json'],
    ['internal hostname', 'https://gateway.internal/1.json'],
    ['non-default port', 'https://example.com:8443/1.json'],
  ])('error: rejects %s uri', async (_name, uri) => {
    await expect(getMetadataAvatarUri({ uri })).rejects.toThrowError(
      'Unable to resolve ENS avatar URI',
    )
  })

  test('error: invalid uri', async () => {
    const server = await createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end('<html><body><h1>Test</h1></body></html>')
    })

    await expect(
      getMetadataAvatarUri({
        gatewayUrls: { ipfs: server.url },
        uri: server.url,
      }),
    ).rejects.toThrowError('Unable to resolve ENS avatar URI')

    await server.close()
  })

  test('error: oversized metadata response', async () => {
    const server = await createServer((req, res) => {
      if (req.url!.includes('image.png')) {
        res.writeHead(200, { 'Content-Type': 'image/png' })
        res.end()
        return
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          image: `${server.url}/image.png`,
          pad: 'a'.repeat(11 * 1024 * 1024),
        }),
      )
    })

    await expect(
      getMetadataAvatarUri({
        gatewayUrls: { ipfs: server.url },
        uri: server.url,
      }),
    ).rejects.toThrowError('Unable to resolve ENS avatar URI')

    await server.close()
  })

  test('error: unresponsive metadata host', async () => {
    const server = await createServer(() => {
      // Stall until the 10s fetch timeout aborts the request.
    })

    await expect(
      getMetadataAvatarUri({
        gatewayUrls: { ipfs: server.url },
        uri: server.url,
      }),
    ).rejects.toThrowError('Unable to resolve ENS avatar URI')

    await server.close()
  })
})

describe('parseAvatarUri', () => {
  test('onchain', async () => {
    await expect(
      parseAvatarUri({ uri: 'data:image/gif;base64,test' }),
    ).resolves.toBe('data:image/gif;base64,test')
  })

  test('image', async () => {
    const server = await createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'image/png' })
      res.end()
    })

    // Trusts the local server origin; bare localhost URLs are rejected.
    await expect(
      parseAvatarUri({ gatewayUrls: { ipfs: server.url }, uri: server.url }),
    ).resolves.toBe(server.url)

    await server.close()
  })

  test.each([
    ['credentialed', 'https://user:password@example.com/image.png'],
    ['IPv4', 'https://127.0.0.1/image.png'],
    ['IPv6', 'https://[::1]/image.png'],
    ['localhost', 'https://localhost/image.png'],
    ['localhost subdomain', 'https://gateway.localhost/image.png'],
    ['internal hostname', 'https://gateway.internal/image.png'],
    ['non-default port', 'https://example.com:8443/image.png'],
  ])('error: rejects %s uri', async (_name, uri) => {
    await expect(parseAvatarUri({ uri })).rejects.toThrowError(
      'Unable to resolve ENS avatar URI',
    )
  })

  test('error: invalid uri', async () => {
    const server = await createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ image: 'test' }))
    })

    await expect(
      parseAvatarUri({ gatewayUrls: { ipfs: server.url }, uri: server.url }),
    ).rejects.toThrowError('Unable to resolve ENS avatar URI')

    await server.close()
  })

  test('error: no content type', async () => {
    const server = await createServer((_req, res) => {
      res.writeHead(200)
      res.end()
    })

    await expect(
      parseAvatarUri({ gatewayUrls: { ipfs: server.url }, uri: server.url }),
    ).rejects.toThrowError('Unable to resolve ENS avatar URI')

    await server.close()
  })

  test('error: request failure', async () => {
    const server = await createServer((req) => {
      req.destroy()
    })

    await expect(
      parseAvatarUri({ gatewayUrls: { ipfs: server.url }, uri: server.url }),
    ).rejects.toThrowError('Unable to resolve ENS avatar URI')

    await server.close()
  })
})

describe('parseNftUri', () => {
  test('erc721', () => {
    expect(parseNftUri('eip155:1/erc721:0x123/1')).toEqual({
      chainId: 1,
      contractAddress: '0x123',
      namespace: 'erc721',
      tokenId: '1',
    })
  })

  test('erc1155', () => {
    expect(parseNftUri('eip155:1/erc1155:0x123/1')).toEqual({
      chainId: 1,
      contractAddress: '0x123',
      namespace: 'erc1155',
      tokenId: '1',
    })
  })

  test('did:nft uri', () => {
    expect(
      parseNftUri(
        'did:nft:eip155:1_erc1155:0x495f947276749ce646f68ac8c248420045cb7b5e_1',
      ),
    ).toEqual({
      chainId: 1,
      contractAddress: '0x495f947276749ce646f68ac8c248420045cb7b5e',
      namespace: 'erc1155',
      tokenId: '1',
    })
  })

  test('uppercase eip namespace', () => {
    expect(parseNftUri('EIP155:1/erc721:0x123/1')).toEqual({
      chainId: 1,
      contractAddress: '0x123',
      namespace: 'erc721',
      tokenId: '1',
    })
  })

  test('error: invalid did:nft uri', () => {
    expect(() =>
      parseNftUri('did:nft:eip155:1_erc1155:0x495f947276749ce646f68ac8c2'),
    ).toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarInvalidNftUriError: ENS NFT avatar URI is invalid. Token ID not found

      Version: viem@2.52.1]
    `)
  })

  test('error: invalid eip namespace', () => {
    expect(() => parseNftUri('eip156:1/erc721:0x123/1'))
      .toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarInvalidNftUriError: ENS NFT avatar URI is invalid. Only EIP-155 supported

      Version: viem@2.52.1]
    `)
  })

  test('error: no chain id', () => {
    expect(() => parseNftUri('eip155:/erc721:0x123/1'))
      .toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarInvalidNftUriError: ENS NFT avatar URI is invalid. Chain ID not found

      Version: viem@2.52.1]
    `)
  })

  test('error: no contract address', () => {
    expect(() => parseNftUri('eip155:1/erc721:/1'))
      .toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarInvalidNftUriError: ENS NFT avatar URI is invalid. Contract address not found

      Version: viem@2.52.1]
    `)
  })

  test('error: no token id', () => {
    expect(() => parseNftUri('eip155:1/erc721:0x123'))
      .toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarInvalidNftUriError: ENS NFT avatar URI is invalid. Token ID not found

      Version: viem@2.52.1]
    `)
  })

  test('error: no erc namespace', () => {
    expect(() => parseNftUri('eip155:1/:0x123/1'))
      .toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarInvalidNftUriError: ENS NFT avatar URI is invalid. ERC namespace not found

      Version: viem@2.52.1]
    `)
  })
})

describe('getNftTokenUri', () => {
  async function deployExample() {
    return await contract.deploy(local, {
      bytecode: AbiConstructor.encode(
        AbiConstructor.fromAbi(generated.EnsAvatarExample.abi),
        {
          args: [
            'https://example.com/metadata/{id}.json',
            'data:application/json;base64,e30=',
            '{}',
          ],
          bytecode: generated.EnsAvatarExample.bytecode.object,
        },
      ),
    })
  }

  test('erc721', async () => {
    const { address } = await deployExample()

    await expect(
      getNftTokenUri(local, {
        nft: {
          chainId: 1,
          contractAddress: address,
          namespace: 'erc721',
          tokenId: '69',
        },
      }),
    ).resolves.toBe('https://example.com/metadata/{id}.json')
  })

  test('erc1155', async () => {
    const { address } = await deployExample()

    await expect(
      getNftTokenUri(local, {
        nft: {
          chainId: 1,
          contractAddress: address,
          namespace: 'erc1155',
          tokenId: '69',
        },
      }),
    ).resolves.toBe('https://example.com/metadata/{id}.json')
  })

  test('error: unsupported namespace', async () => {
    await expect(
      getNftTokenUri(local, {
        nft: {
          chainId: 1,
          contractAddress: '0x0000000000000000000000000000000000000000',
          namespace: 'erc20',
          tokenId: '1',
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarUnsupportedNamespaceError: ENS NFT avatar namespace "erc20" is not supported. Must be "erc721" or "erc1155".

      Version: viem@2.52.1]
    `)
  })
})
