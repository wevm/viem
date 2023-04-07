import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import {
  deployEnsAvatarTokenUri,
  publicClient,
  setBlockNumber,
} from '../../../_test/index.js'
import { parseAvatarRecord } from './parseAvatarRecord.js'
import { getBlockNumber } from '../../../actions/index.js'

let blockNumber: bigint
beforeAll(async () => {
  blockNumber = await getBlockNumber(publicClient)
  await setBlockNumber(16773780n)
})

afterAll(async () => {
  await setBlockNumber(blockNumber)
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
          'eip155:1/erc1155:0x495f947276749Ce646f68AC8c248420045cb7b5e/8112316025873927737505937898915153732580103913704334048512380490797008551937',
      }),
    ).toMatchInlineSnapshot(
      '"https://i.seadn.io/gae/hKHZTZSTmcznonu8I6xcVZio1IF76fq0XmcxnvUykC-FGuVJ75UPdLDlKJsfgVXH9wOSmkyHw0C39VAYtsGyxT7WNybjQ6s3fM3macE?w=500&auto=format"',
    )
  })
})
