import { afterAll, beforeAll, expect, test } from 'vitest'
import { optimism } from '../../chains.js'
import { createPublicClient, http } from '../../clients/index.js'

import {
  localHttpUrl,
  publicClient,
  setBlockNumber,
} from '../../_test/index.js'
import { setVitalikResolver } from '../../_test/utils.js'
import { getBlockNumber } from '../public/index.js'
import { getEnsAddress } from './getEnsAddress.js'

let blockNumber: bigint
beforeAll(async () => {
  blockNumber = await getBlockNumber(publicClient)
  await setBlockNumber(16773780n)
  await setVitalikResolver()
})

afterAll(async () => {
  await setBlockNumber(blockNumber)
})

test('gets address for name', async () => {
  await expect(
    getEnsAddress(publicClient, { name: 'awkweb.eth' }),
  ).resolves.toMatchInlineSnapshot(
    '"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e"',
  )
})

test('name without address', async () => {
  await expect(
    getEnsAddress(publicClient, { name: 'another-unregistered-name.eth' }),
  ).resolves.toBeNull()
})

test('name with resolver that does not support addr', async () => {
  await expect(
    getEnsAddress(publicClient, { name: 'vitalik.eth' }),
  ).resolves.toBeNull()
})

test('name that looks like a hex', async () => {
  await expect(
    getEnsAddress(publicClient, { name: '0xyoshi.eth' }),
  ).resolves.toMatchInlineSnapshot(
    '"0xE332de3c84C305698675A73F366061941C78e3b4"',
  )
  await expect(
    getEnsAddress(publicClient, { name: '0xdeadbeef.eth' }),
  ).resolves.toMatchInlineSnapshot(
    '"0xA8cc612Ecb2E853d3A882b0F9cf5357C2D892aDb"',
  )
})

test('custom universal resolver address', async () => {
  await expect(
    getEnsAddress(publicClient, {
      name: 'awkweb.eth',
      universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
    }),
  ).resolves.toMatchInlineSnapshot(
    '"0xA0Cf798816D4b9b9866b5330EEa46a18382f251e"',
  )
})

test('chain not provided', async () => {
  await expect(
    getEnsAddress(
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
    getEnsAddress(
      createPublicClient({
        chain: optimism,
        transport: http(),
      }),
      { name: 'awkweb.eth' },
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
    getEnsAddress(publicClient, { name: 'awkweb.eth', blockNumber: 14353601n }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "Chain \\"Localhost\\" does not support contract \\"ensUniversalResolver\\".

    This could be due to any of the following:
    - The contract \\"ensUniversalResolver\\" was not deployed until block 16773775 (current block 14353601).

    Version: viem@1.0.2"
  `)
})

test('invalid universal resolver address', async () => {
  await expect(
    getEnsAddress(publicClient, {
      name: 'awkweb.eth',
      universalResolverAddress: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "The contract function \\"resolve\\" reverted with the following reason:
    execution reverted

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  resolve(bytes name, bytes data)
      args:             (0x0661776b7765620365746800, 0x3b3b57de52d0f5fbf348925621be297a61b88ec492ebbbdfa9477d82892e2786020ad61c)

    Docs: https://viem.sh/docs/contract/readContract.html
    Version: viem@1.0.2"
  `)
})
