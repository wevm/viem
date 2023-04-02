import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { publicClient, setBlockNumber } from '../../_test'
import { getBlockNumber } from '../public'
import { getEnsAvatar } from './getEnsAvatar'

let blockNumber: bigint
beforeAll(async () => {
  blockNumber = await getBlockNumber(publicClient)
  await setBlockNumber(16773780n)
})
afterAll(async () => {
  await setBlockNumber(blockNumber)
})

test('name without avatar record', async () => {
  await expect(
    getEnsAvatar(publicClient, {
      name: 'unregistered-name.eth',
    }),
  ).resolves.toBeNull()
})

describe('gets avatar uri for name via', () => {
  test('standard url', async () => {
    await expect(
      getEnsAvatar(publicClient, { name: 'coinbase.eth' }),
    ).resolves.toMatchInlineSnapshot(
      '"https://images.ctfassets.net/q5ulk4bp65r7/1rFQCqoq8hipvVJSKdU3fQ/21ab733af7a8ab404e29b873ffb28348/coinbase-icon2.svg"',
    )
  })

  test('ipfs', async () => {
    await expect(
      getEnsAvatar(publicClient, { name: 'tanrikulu.eth' }),
    ).resolves.toMatchInlineSnapshot(
      '"https://ipfs.io/ipfs/QmUShgfoZQSHK3TQyuTfUpsc8UfeNfD8KwPUvDBUdZ4nmR"',
    )
  })

  test('ipfs gateway', async () => {
    await expect(
      getEnsAvatar(publicClient, { name: 'wagmi-dev.eth' }),
    ).resolves.toMatchInlineSnapshot(
      '"https://ipfs.io/ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio"',
    )
  })

  test('nft', async () => {
    await expect(
      getEnsAvatar(publicClient, { name: 'nick.eth' }),
    ).resolves.toMatchInlineSnapshot(
      '"https://i.seadn.io/gae/hKHZTZSTmcznonu8I6xcVZio1IF76fq0XmcxnvUykC-FGuVJ75UPdLDlKJsfgVXH9wOSmkyHw0C39VAYtsGyxT7WNybjQ6s3fM3macE?w=500&auto=format"',
    )
  })
}, 20000)
