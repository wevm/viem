import { afterAll, beforeAll, expect, test } from 'vitest'
import { createPublicClient, http } from '../../clients'
import { localHttpUrl, publicClient, setBlockNumber } from '../../_test'
import { getBlockNumber } from '../public'
import { getEnsResolver } from './getEnsResolver'

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
    await getEnsResolver(publicClient, {
      name: 'jxom.eth',
    }),
  ).toMatchInlineSnapshot('"0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"')
  expect(
    await getEnsResolver(publicClient, {
      name: 'test.eth',
    }),
  ).toMatchInlineSnapshot('"0x226159d592E2b063810a10Ebf6dcbADA94Ed68b8"')
})

test('custom universal resolver address', async () => {
  await expect(
    getEnsResolver(publicClient, {
      name: 'awkweb.eth',
      universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
    }),
  ).resolves.toMatchInlineSnapshot(
    '"0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"',
  )
})

test('chain not provided', async () => {
  await expect(
    getEnsResolver(
      createPublicClient({
        transport: http(localHttpUrl),
      }),
      { name: 'awkweb.eth' },
    ),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    '"client chain not configured. universalResolverAddress is required."',
  )
})
