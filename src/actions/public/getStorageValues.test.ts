import type { Address } from 'abitype'
import { expect, test } from 'vitest'

import { wagmiContractConfig } from '~test/abis.js'
import { anvilMainnet } from '~test/anvil.js'

import { getBlock } from './getBlock.js'
import { getStorageAt } from './getStorageAt.js'
import { getStorageValues } from './getStorageValues.js'

const client = anvilMainnet.getClient()
const slot0 = `0x${'0'.repeat(64)}` as const
const slot1 = `0x${'0'.repeat(63)}1` as const
const address = wagmiContractConfig.address.toLowerCase() as Address

test('default', async () => {
  expect(
    await getStorageValues(client, {
      requests: { [wagmiContractConfig.address]: [slot0, slot1] },
    }),
  ).toMatchInlineSnapshot(`
    {
      "0xfba3912ca04dd458c843e2ee08967fc04f3579c2": [
        "0x7761676d6900000000000000000000000000000000000000000000000000000a",
        "0x5741474d4900000000000000000000000000000000000000000000000000000a",
      ],
    }
  `)
})

test('args: blockNumber', async () => {
  const result = await getStorageValues(client, {
    requests: { [wagmiContractConfig.address]: [slot0, slot1] },
    blockNumber: anvilMainnet.forkBlockNumber,
  })

  expect(result[address]).toEqual([
    await getStorageAt(client, {
      address: wagmiContractConfig.address,
      slot: slot0,
      blockNumber: anvilMainnet.forkBlockNumber,
    }),
    await getStorageAt(client, {
      address: wagmiContractConfig.address,
      slot: slot1,
      blockNumber: anvilMainnet.forkBlockNumber,
    }),
  ])
})

test('args: blockHash (EIP-1898)', async () => {
  const block = await getBlock(client, {
    blockNumber: anvilMainnet.forkBlockNumber,
  })

  expect(
    await getStorageValues(client, {
      requests: { [wagmiContractConfig.address]: [slot0] },
      blockHash: block.hash!,
    }),
  ).toMatchInlineSnapshot(`
    {
      "0xfba3912ca04dd458c843e2ee08967fc04f3579c2": [
        "0x7761676d6900000000000000000000000000000000000000000000000000000a",
      ],
    }
  `)
})
