import { expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { getBlock } from './getBlock.js'
import { getProof } from './getProof.js'

const client = anvilMainnet.getClient()

// WETH on Ethereum mainnet.
const address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const storageKeys = [
  '0x0000000000000000000000000000000000000000000000000000000000000000',
] satisfies `0x${string}`[]

test('default', async () => {
  const result = await getProof(client, {
    address,
    storageKeys,
  })

  expect(Object.keys(result)).toMatchInlineSnapshot(`
    [
      "address",
      "balance",
      "codeHash",
      "nonce",
      "storageHash",
      "accountProof",
      "storageProof",
    ]
  `)
})

test('args: blockHash (EIP-1898)', async () => {
  const block = await getBlock(client, { blockTag: 'latest' })

  const result = await getProof(client, {
    address,
    storageKeys,
    blockHash: block.hash!,
  })

  expect(Object.keys(result)).toMatchInlineSnapshot(`
    [
      "address",
      "balance",
      "codeHash",
      "nonce",
      "storageHash",
      "accountProof",
      "storageProof",
    ]
  `)
})

test('args: blockHash + requireCanonical (EIP-1898)', async () => {
  const block = await getBlock(client, { blockTag: 'latest' })

  const result = await getProof(client, {
    address,
    storageKeys,
    blockHash: block.hash!,
    requireCanonical: true,
  })

  expect(Object.keys(result)).toMatchInlineSnapshot(`
    [
      "address",
      "balance",
      "codeHash",
      "nonce",
      "storageHash",
      "accountProof",
      "storageProof",
    ]
  `)
})
