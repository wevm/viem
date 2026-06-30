import { expect, test } from 'vitest'

import { wagmiContractConfig } from '~test/abis.js'
import { anvilMainnet } from '~test/anvil.js'
import type { Hash } from '../../types/misc.js'
import { getBlock } from './getBlock.js'
import { getProof } from './getProof.js'

const client = anvilMainnet.getClient()
const storageKeys: Hash[] = [
  '0x0000000000000000000000000000000000000000000000000000000000000000',
]

test('default', async () => {
  const result = await getProof(client, {
    address: wagmiContractConfig.address,
    storageKeys,
  })

  expect(Object.keys(result).sort()).toMatchInlineSnapshot(`
    [
      "accountProof",
      "address",
      "balance",
      "codeHash",
      "nonce",
      "storageHash",
      "storageProof",
    ]
  `)
})

test('args: blockHash (EIP-1898)', async () => {
  const block = await getBlock(client, {
    blockNumber: anvilMainnet.forkBlockNumber,
  })

  const result = await getProof(client, {
    address: wagmiContractConfig.address,
    storageKeys,
    blockHash: block.hash!,
  })

  expect(Object.keys(result).sort()).toMatchInlineSnapshot(`
    [
      "accountProof",
      "address",
      "balance",
      "codeHash",
      "nonce",
      "storageHash",
      "storageProof",
    ]
  `)
})

test('args: blockHash + requireCanonical (EIP-1898)', async () => {
  const block = await getBlock(client, {
    blockNumber: anvilMainnet.forkBlockNumber,
  })

  const result = await getProof(client, {
    address: wagmiContractConfig.address,
    storageKeys,
    blockHash: block.hash!,
    requireCanonical: true,
  })

  expect(Object.keys(result).sort()).toMatchInlineSnapshot(`
    [
      "accountProof",
      "address",
      "balance",
      "codeHash",
      "nonce",
      "storageHash",
      "storageProof",
    ]
  `)
})
