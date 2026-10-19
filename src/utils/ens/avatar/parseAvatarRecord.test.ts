import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { createHttpServer, deployEnsAvatarTokenUri } from '~test/utils.js'

import { reset } from '../../../actions/index.js'
import { parseAvatarRecord } from './parseAvatarRecord.js'

const client = anvilMainnet.getClient()

const ipfsImageContentTypes = {
  QmbUCe7JMPsG39FRaLaJ9VwSKrE74PzEb1s4DKuEkARepS: 'image/png',
  'QmSP4nq9fnN9dAiCj42ug9Wa79rqmQerZXZch82VqpiH7U/image.gif': 'image/gif',
} as const

// Metadata of token 10063 of the ERC-1155 contract used in the `erc 1155` test.
const ipfsMetadataHash = 'QmYTuHaoY1winNAxmf7JmCmSrkChuMAAnqgSuJBTiWZe9f'

let ipfsGateway: Awaited<ReturnType<typeof createHttpServer>>
let metadataServer: Awaited<ReturnType<typeof createHttpServer>>

beforeAll(async () => {
  ipfsGateway = await createHttpServer((req, res) => {
    if (req.url?.includes(ipfsMetadataHash)) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          image:
            'ipfs://QmSP4nq9fnN9dAiCj42ug9Wa79rqmQerZXZch82VqpiH7U/image.gif',
        }),
      )
      return
    }
    const contentType = Object.entries(ipfsImageContentTypes).find(([path]) =>
      req.url?.includes(path),
    )?.[1]
    res.writeHead(200, { 'Content-Type': contentType ?? 'text/plain' })
    res.end()
  })
  metadataServer = await createHttpServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        image: 'ipfs://QmbUCe7JMPsG39FRaLaJ9VwSKrE74PzEb1s4DKuEkARepS',
      }),
    )
  })

  await reset(client, {
    blockNumber: 23_085_558n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
})

afterAll(() => Promise.all([ipfsGateway.close(), metadataServer.close()]))

test('default', async () => {
  expect(
    await parseAvatarRecord(client, {
      record:
        'https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg',
    }),
  ).toMatchInlineSnapshot(
    '"https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg"',
  )
})

describe('nft', () => {
  test('default ({id} template)', async () => {
    const { contractAddress } = await deployEnsAvatarTokenUri({
      metadataUri: `${metadataServer.url}/`,
    })
    expect(
      await parseAvatarRecord(client, {
        gatewayUrls: { ipfs: ipfsGateway.url },
        record: `eip155:1/erc721:${contractAddress}/69`,
      }),
    ).toBe(
      `${ipfsGateway.url}/ipfs/QmbUCe7JMPsG39FRaLaJ9VwSKrE74PzEb1s4DKuEkARepS`,
    )
  })

  test('onchain (encoded json)', async () => {
    const { contractAddress } = await deployEnsAvatarTokenUri({
      metadataUri: `${metadataServer.url}/`,
    })
    expect(
      await parseAvatarRecord(client, {
        record: `eip155:1/erc721:${contractAddress}/100`,
      }),
    ).toMatchInlineSnapshot(
      '"https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg"',
    )
  })

  test('onchain (raw json)', async () => {
    const { contractAddress } = await deployEnsAvatarTokenUri({
      metadataUri: `${metadataServer.url}/`,
    })
    expect(
      await parseAvatarRecord(client, {
        record: `eip155:1/erc721:${contractAddress}/108`,
      }),
    ).toMatchInlineSnapshot(
      '"https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg"',
    )
  })

  test('erc 1155', async () => {
    expect(
      await parseAvatarRecord(client, {
        gatewayUrls: { ipfs: ipfsGateway.url },
        record:
          'eip155:1/erc1155:0xb32979486938aa9694bfc898f35dbed459f44424/10063',
      }),
    ).toBe(
      `${ipfsGateway.url}/ipfs/QmSP4nq9fnN9dAiCj42ug9Wa79rqmQerZXZch82VqpiH7U/image.gif`,
    )
  })
})
