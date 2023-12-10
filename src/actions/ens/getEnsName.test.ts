import { beforeAll, describe, expect, test } from 'vitest'

import { address, localHttpUrl } from '~test/src/constants.js'
import { publicClient, setBlockNumber } from '~test/src/utils.js'
import { optimism } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'

import { getEnsName } from './getEnsName.js'

beforeAll(async () => {
  await setBlockNumber(17680470n)
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

test('address with primary name that has no resolver', async () => {
  await expect(
    getEnsName(publicClient, {
      address: '0x00000000000061aD8EE190710508A818aE5325C3',
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

describe('universal resolver with custom errors', () => {
  test('address with no primary name', async () => {
    await expect(
      getEnsName(publicClient, {
        address: address.burn,
        universalResolverAddress: '0x9380F1974D2B7064eA0c0EC251968D8c69f0Ae31',
      }),
    ).resolves.toMatchInlineSnapshot('null')
  })
  test('address with primary name that has no resolver', async () => {
    await expect(
      getEnsName(publicClient, {
        address: '0x00000000000061aD8EE190710508A818aE5325C3',
        universalResolverAddress: '0x9380F1974D2B7064eA0c0EC251968D8c69f0Ae31',
      }),
    ).resolves.toMatchInlineSnapshot('null')
  })
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
    '[Error: client chain not configured. universalResolverAddress is required.]',
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
    [ChainDoesNotSupportContract: Chain "OP Mainnet" does not support contract "ensUniversalResolver".

    This could be due to any of the following:
    - The chain does not have the contract "ensUniversalResolver" configured.

    Version: viem@1.0.2]
  `)
})

test('universal resolver contract deployed on later block', async () => {
  await expect(
    getEnsName(publicClient, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
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
    getEnsName(publicClient, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
      universalResolverAddress: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "reverse" reverted.

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  reverse(bytes reverseName)
      args:             (0x28613063663739383831366434623962393836366235333330656561343661313833383266323531650461646472077265766572736500)

    Docs: https://viem.sh/docs/contract/readContract.html
    Version: viem@1.0.2]
  `)
})

test('resolved address mismatch', async () => {
  await setBlockNumber(18753647n)
  expect(
    await getEnsName(publicClient, {
      address: '0xe756236ef7FD64Ebbb360465C621c7dB5a336F4d',
    }),
  ).toBeNull()
})
