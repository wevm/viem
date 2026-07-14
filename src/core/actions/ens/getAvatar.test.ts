import { AbiConstructor, Ens } from 'ox'
import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'
import { createServer } from '~test/http.js'
import { beforeAll, describe, expect, test } from 'vitest'

import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

import { getAvatar } from './getAvatar.js'
import { parseAvatarRecord } from './internal/avatar.js'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})

const local = anvil.getClient(anvil.local)

beforeAll(async () => {
  await Actions.state.reset(client, {
    blockNumber: 23_085_558n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
})

/** Serves `/image.png` (HEAD, `image/png`) and `/metadata*` (JSON pointing at the image). */
async function createAssetServer() {
  const server = await createServer((req, res) => {
    if (req.url!.includes('image.png')) {
      res.writeHead(200, { 'Content-Type': 'image/png' })
      res.end()
      return
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ image: `${server.url}/image.png` }))
  })
  return server
}

test('behavior: name without avatar record', async () => {
  await expect(
    getAvatar(client, { name: Ens.normalize('unregistered-name-viem-v3.eth') }),
  ).resolves.toBeNull()
})

describe('parseAvatarRecord', () => {
  test('http record', async () => {
    const server = await createAssetServer()

    await expect(
      parseAvatarRecord(local, { record: `${server.url}/image.png` }),
    ).resolves.toBe(`${server.url}/image.png`)

    await server.close()
  })

  test('ipfs record (gateway override)', async () => {
    const server = await createAssetServer()

    await expect(
      parseAvatarRecord(local, {
        gatewayUrls: { ipfs: server.url },
        record:
          'ipfs://QmbUCe7JMPsG39FRaLaJ9VwSKrE74PzEb1s4DKuEkARepS/image.png',
      }),
    ).resolves.toBe(
      `${server.url}/ipfs/QmbUCe7JMPsG39FRaLaJ9VwSKrE74PzEb1s4DKuEkARepS/image.png`,
    )

    await server.close()
  })

  test('data URI record', async () => {
    await expect(
      parseAvatarRecord(local, {
        record: 'data:image/png;base64,aGVsbG8=',
      }),
    ).resolves.toBe('data:image/png;base64,aGVsbG8=')
  })

  test('behavior: unresolvable record', async () => {
    await expect(parseAvatarRecord(local, { record: 'not-a-uri' })).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [EnsAvatarUriResolutionError: Unable to resolve ENS avatar URI "not-a-uri". The URI may be malformed, invalid, or does not respond with a valid image.

      Version: viem@2.52.1]
    `)
  })

  describe('nft records', () => {
    async function deployExample(server: { url: string }) {
      const encodedJson = Buffer.from(
        JSON.stringify({ image: `${server.url}/image.png` }),
      ).toString('base64')
      return await contract.deploy(local, {
        bytecode: AbiConstructor.encode(
          AbiConstructor.fromAbi(generated.EnsAvatarExample.abi),
          {
            args: [
              `${server.url}/metadata/{id}`,
              `data:application/json;base64,${encodedJson}`,
              JSON.stringify({ image: `${server.url}/image.png` }),
            ],
            bytecode: generated.EnsAvatarExample.bytecode.object,
          },
        ),
      })
    }

    test('erc721 ({id} template metadata)', async () => {
      const server = await createAssetServer()
      const { address } = await deployExample(server)

      await expect(
        parseAvatarRecord(local, {
          record: `eip155:1/erc721:${address}/69`,
        }),
      ).resolves.toBe(`${server.url}/image.png`)

      await server.close()
    })

    test('erc721 (onchain encoded json)', async () => {
      const server = await createAssetServer()
      const { address } = await deployExample(server)

      await expect(
        parseAvatarRecord(local, {
          record: `eip155:1/erc721:${address}/100`,
        }),
      ).resolves.toBe(`${server.url}/image.png`)

      await server.close()
    })

    test('erc721 (onchain raw json)', async () => {
      const server = await createAssetServer()
      const { address } = await deployExample(server)

      await expect(
        parseAvatarRecord(local, {
          record: `eip155:1/erc721:${address}/108`,
        }),
      ).resolves.toBe(`${server.url}/image.png`)

      await server.close()
    })

    test('erc1155', async () => {
      const server = await createAssetServer()
      const { address } = await deployExample(server)

      await expect(
        parseAvatarRecord(local, {
          record: `eip155:1/erc1155:${address}/10063`,
        }),
      ).resolves.toBe(`${server.url}/image.png`)

      await server.close()
    })

    test('behavior: invalid nft uri', async () => {
      await expect(
        parseAvatarRecord(local, {
          record: 'eip155:1/erc721:0x0000000000000000000000000000000000000000',
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [EnsAvatarInvalidNftUriError: ENS NFT avatar URI is invalid. Token ID not found

        Version: viem@2.52.1]
      `)
    })

    test('behavior: unsupported namespace', async () => {
      await expect(
        parseAvatarRecord(local, {
          record: `eip155:1/erc20:${constants.accounts[0].address}/1`,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [EnsAvatarUnsupportedNamespaceError: ENS NFT avatar namespace "erc20" is not supported. Must be "erc721" or "erc1155".

        Version: viem@2.52.1]
      `)
    })
  })
})
