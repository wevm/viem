import { beforeAll, describe, expect, test } from 'vitest'

import {
  deployEnsAvatarTokenUri,
  publicClient,
  setBlockNumber,
} from '~test/src/utils.js'

import { parseAvatarRecord } from './parseAvatarRecord.js'

beforeAll(async () => {
  await setBlockNumber(19_258_213n)
})

test('default', async () => {
  expect(
    await parseAvatarRecord(publicClient, {
      record:
        'https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg',
    }),
  ).toMatchInlineSnapshot(
    '"https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg"',
  )
})

describe('nft', () => {
  test('default ({id} template)', async () => {
    const { contractAddress } = await deployEnsAvatarTokenUri()
    expect(
      await parseAvatarRecord(publicClient, {
        record: `eip155:1/erc721:${contractAddress}/69`,
      }),
    ).toMatchInlineSnapshot(
      '"https://ipfs.io/ipfs/QmbUCe7JMPsG39FRaLaJ9VwSKrE74PzEb1s4DKuEkARepS"',
    )
  })

  test('onchain (encoded json)', async () => {
    const { contractAddress } = await deployEnsAvatarTokenUri()
    expect(
      await parseAvatarRecord(publicClient, {
        record: `eip155:1/erc721:${contractAddress}/100`,
      }),
    ).toMatchInlineSnapshot(
      '"https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg"',
    )
  })

  test('onchain (raw json)', async () => {
    const { contractAddress } = await deployEnsAvatarTokenUri()
    expect(
      await parseAvatarRecord(publicClient, {
        record: `eip155:1/erc721:${contractAddress}/108`,
      }),
    ).toMatchInlineSnapshot(
      '"https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg"',
    )
  })

  test('erc 1155', async () => {
    expect(
      await parseAvatarRecord(publicClient, {
        record:
          'eip155:1/erc1155:0xb32979486938aa9694bfc898f35dbed459f44424/10063',
      }),
    ).toMatchInlineSnapshot(
      '"https://ipfs.io/ipfs/QmSP4nq9fnN9dAiCj42ug9Wa79rqmQerZXZch82VqpiH7U/image.gif"',
    )
  })
})
