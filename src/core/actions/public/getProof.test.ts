import * as anvil from '~test/anvil.js'
import { describe, expect, test } from 'vitest'

import { getProof } from './getProof.js'

const client = anvil.getClient(anvil.mainnet)

const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const storageKey =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

describe('getProof', () => {
  test('default', async () => {
    const proof = await getProof(client, {
      address: weth,
      storageKeys: [storageKey],
    })
    expect(Object.keys(proof)).toMatchInlineSnapshot(`
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
    expect({
      address: proof.address,
      balance: proof.balance,
      codeHash: proof.codeHash,
      nonce: proof.nonce,
      storageHash: proof.storageHash,
      storageProofEntry: {
        key: proof.storageProof[0]?.key,
        value: proof.storageProof[0]?.value,
      },
    }).toMatchInlineSnapshot(`
      {
        "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "balance": 2780879341265161775352224n,
        "codeHash": "0xd0a06b12ac47863b5c7be4185c2deaad1c61557033f56c7d4ea74429cbb25e23",
        "nonce": 1,
        "storageHash": "0x586b35e0ad94a5f8e48d826000b6ce3be85adfe12c0143a09c2e39b96a3996a2",
        "storageProofEntry": {
          "key": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "value": 39553310892875263560936207548857176834471854732421237974622739861269930573850n,
        },
      }
    `)
  })

  test('args: blockNumber', async () => {
    const proof = await getProof(client, {
      address: weth,
      blockNumber: anvil.mainnet.forkBlockNumber,
      storageKeys: [storageKey],
    })
    expect(typeof proof.balance).toBe('bigint')
    expect(typeof proof.nonce).toBe('number')
    expect(proof.accountProof.length).toBeGreaterThan(0)
  })
})
