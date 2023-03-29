import { expect, test } from 'vitest'
import { optimism } from '../../chains'
import { createPublicClient, http } from '../../clients'

import { localHttpUrl, publicClient } from '../../_test'

import { getEnsAvatar } from './getEnsAvatar'

test('gets avatar for address', async () => {
  await expect(
    getEnsAvatar(publicClient, {
      name: 'kesar.eth',
      universalResolverAddress: '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41',
    }),
  ).resolves.toMatchInlineSnapshot('"https://pbs.twimg.com/profile_images/1576892738389393408/Cu7lPQcl_400x400.jpg"')
})

test('address with no avatar', async () => {
  await expect(
    getEnsAvatar(publicClient, {
      name: 'nonenone.cafe',
      universalResolverAddress: '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41',
    }),
  ).resolves.toMatchInlineSnapshot('""')
})

test('chain not provided', async () => {
  await expect(
    getEnsAvatar(
      createPublicClient({
        transport: http(localHttpUrl),
      }),
      { name: 'kesar.eth' },
    ),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    '"client chain not configured. universalResolverAddress is required."',
  )
})

test('universal resolver contract not configured for chain', async () => {
  await expect(
    getEnsAvatar(
      createPublicClient({
        chain: optimism,
        transport: http(),
      }),
      {
        name: 'kesar.eth',
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
    getEnsAvatar(publicClient, {
      name: 'kesar.eth',
      blockNumber: 14353601n,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "Chain \\"Localhost\\" does not support contract \\"ensUniversalResolver\\".

    This could be due to any of the following:
    - The contract \\"ensUniversalResolver\\" was not deployed until block 16172161 (current block 14353601).

    Version: viem@1.0.2"
  `)
})

test('invalid universal resolver address', async () => {
  await expect(
    getEnsAvatar(publicClient, {
      name: 'kesar.eth',
      universalResolverAddress: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "The contract function \\"text\\" reverted with the following reason:
    execution reverted

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  text(bytes32 node, string key)
      args:          (0xad23e4cc05a947a6fb54bcd02b082c2103b30ac7d60b17bfc5c494aa1403e33b, avatar)

    Docs: https://viem.sh/docs/contract/readContract.html
    Version: viem@1.0.2"
  `)
})
