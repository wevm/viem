import { beforeAll, describe, expect, test } from 'vitest'

import { localHttpUrl } from '~test/src/constants.js'
import {
  publicClient,
  setBlockNumber,
  setVitalikResolver,
} from '~test/src/utils.js'
import { optimism } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'

import { getEnsText } from './getEnsText.js'

beforeAll(async () => {
  await setBlockNumber(17431812n)
  await setVitalikResolver()
})

test('gets text record for name', async () => {
  await expect(
    getEnsText(publicClient, { name: 'wagmi-dev.eth', key: 'com.twitter' }),
  ).resolves.toMatchInlineSnapshot('"wagmi_sh"')
})

test('name without text record', async () => {
  await expect(
    getEnsText(publicClient, {
      name: 'unregistered-name.eth',
      key: 'com.twitter',
    }),
  ).resolves.toBeNull()
})

test('name with resolver that does not support text()', async () => {
  await expect(
    getEnsText(publicClient, {
      name: 'vitalik.eth',
      key: 'com.twitter',
    }),
  ).resolves.toBeNull()
})

test('name without resolver', async () => {
  await expect(
    getEnsText(publicClient, {
      name: 'random1223232222.eth',
      key: 'com.twitter',
    }),
  ).resolves.toBeNull()
})

test('custom universal resolver address', async () => {
  await expect(
    getEnsText(publicClient, {
      name: 'wagmi-dev.eth',
      key: 'com.twitter',
      universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376',
    }),
  ).resolves.toMatchInlineSnapshot('"wagmi_sh"')
})

describe('universal resolver with custom errors', () => {
  test('name without resolver', async () => {
    await expect(
      getEnsText(publicClient, {
        name: 'random123.zzz',
        key: 'com.twitter',
        universalResolverAddress: '0x9380F1974D2B7064eA0c0EC251968D8c69f0Ae31',
      }),
    ).resolves.toBeNull()
  })
  test('name with invalid wildcard resolver', async () => {
    await expect(
      getEnsText(publicClient, {
        name: 'random1223232222.eth',
        key: 'com.twitter',
        universalResolverAddress: '0x9380F1974D2B7064eA0c0EC251968D8c69f0Ae31',
      }),
    ).resolves.toBeNull()
  })
})

test('chain not provided', async () => {
  await expect(
    getEnsText(
      createPublicClient({
        transport: http(localHttpUrl),
      }),
      {
        name: 'wagmi-dev.eth',
        key: 'com.twitter',
      },
    ),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    '[Error: client chain not configured. universalResolverAddress is required.]',
  )
})

test('universal resolver contract not configured for chain', async () => {
  await expect(
    getEnsText(
      createPublicClient({
        chain: optimism,
        transport: http(),
      }),
      {
        name: 'wagmi-dev.eth',
        key: 'com.twitter',
      },
    ),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ChainDoesNotSupportContract: Chain "OP Mainnet" does not support contract "ensUniversalResolver".

    This could be due to any of the following:
    - The chain does not have the contract "ensUniversalResolver" configured.

    Version: viem@1.0.2]
  `)
})

test('universal resolver contract deployed on later block', async () => {
  await expect(
    getEnsText(publicClient, {
      name: 'wagmi-dev.eth',
      key: 'com.twitter',
      blockNumber: 14353601n,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ChainDoesNotSupportContract: Chain "Localhost" does not support contract "ensUniversalResolver".

    This could be due to any of the following:
    - The contract "ensUniversalResolver" was not deployed until block 16966585 (current block 14353601).

    Version: viem@1.0.2]
  `)
})

test('invalid universal resolver address', async () => {
  await expect(
    getEnsText(publicClient, {
      name: 'wagmi-dev.eth',
      key: 'com.twitter',
      universalResolverAddress: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "resolve" reverted.

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  resolve(bytes name, bytes data)
      args:             (0x097761676d692d6465760365746800, 0x59d1d43cf246651c1b9a6b141d19c2604e9a58f567973833990f830d882534a7478013590000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b636f6d2e74776974746572000000000000000000000000000000000000000000)

    Docs: https://viem.sh/docs/contract/readContract.html
    Version: viem@1.0.2]
  `)
})
