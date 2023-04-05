import { afterAll, beforeAll, expect, test } from 'vitest'
import { optimism } from '../../chains.js'
import { createPublicClient, http } from '../../clients/index.js'
import {
  localHttpUrl,
  publicClient,
  setBlockNumber,
} from '../../_test/index.js'
import { getBlockNumber } from '../public/index.js'
import { getEnsResolver } from './getEnsResolver.js'

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

test('universal resolver contract not configured for chain', async () => {
  await expect(
    getEnsResolver(
      createPublicClient({
        chain: optimism,
        transport: http(),
      }),
      {
        name: 'jxom.eth',
      },
    ),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "Chain \\"Optimism\\" does not support contract \\"ensUniversalResolver\\".

    This could be due to any of the following:
    - The chain does not have the contract \\"ensUniversalResolver\\" configured.

    Version: viem@1.0.2"
  `)
})

test('universal resolver contract deployed on later block', async () => {
  await expect(
    getEnsResolver(publicClient, {
      name: 'jxom.eth',
      blockNumber: 14353601n,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "Chain \\"Localhost\\" does not support contract \\"ensUniversalResolver\\".

    This could be due to any of the following:
    - The contract \\"ensUniversalResolver\\" was not deployed until block 16773775 (current block 14353601).

    Version: viem@1.0.2"
  `)
})

test('invalid universal resolver address', async () => {
  await expect(
    getEnsResolver(publicClient, {
      name: 'jxom.eth',
      universalResolverAddress: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "The contract function \\"findResolver\\" reverted with the following reason:
    execution reverted

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  findResolver(bytes)
      args:                  (0x046a786f6d0365746800)

    Docs: https://viem.sh/docs/contract/readContract.html
    Version: viem@1.0.2"
  `)
})
