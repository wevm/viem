import { afterAll, beforeAll, expect, test } from 'vitest'
import { optimism } from '../../chains.js'
import { createPublicClient, http } from '../../clients/index.js'

import {
  address,
  initialBlockNumber,
  localHttpUrl,
  publicClient,
  setBlockNumber,
} from '../../_test/index.js'

import { getEnsName } from './getEnsName.js'

beforeAll(async () => {
  await setBlockNumber(16773780n)
})

afterAll(async () => {
  await setBlockNumber(initialBlockNumber)
})

test('gets primary name for address', async () => {
  await expect(
    getEnsName(publicClient, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    }),
  ).resolves.toMatchInlineSnapshot('"awkweb.eth"')
})

test('address with no primary name', async () => {
  await expect(
    getEnsName(publicClient, {
      address: address.burn,
    }),
  ).resolves.toMatchInlineSnapshot('null')
})

test('custom universal resolver address', async () => {
  await expect(
    getEnsName(publicClient, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
      universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
    }),
  ).resolves.toMatchInlineSnapshot('"awkweb.eth"')
})

test('chain not provided', async () => {
  await expect(
    getEnsName(
      createPublicClient({
        transport: http(localHttpUrl),
      }),
      { address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e' },
    ),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    '"client chain not configured. universalResolverAddress is required."',
  )
})

test('universal resolver contract not configured for chain', async () => {
  await expect(
    getEnsName(
      createPublicClient({
        chain: optimism,
        transport: http(),
      }),
      {
        address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
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
    getEnsName(publicClient, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
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
    getEnsName(publicClient, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
      universalResolverAddress: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "The contract function \\"reverse\\" reverted with the following reason:
    execution reverted

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  reverse(bytes reverseName)
      args:             (0x28613063663739383831366434623962393836366235333330656561343661313833383266323531650461646472077265766572736500)

    Docs: https://viem.sh/docs/contract/readContract.html
    Version: viem@1.0.2"
  `)
})
