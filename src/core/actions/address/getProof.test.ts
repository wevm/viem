import * as anvil from '~test/anvil.js'
import { Actions } from 'viem'
import { beforeAll, expect, test } from 'vitest'

const client = anvil.getClient(anvil.mainnet)

// Latest-block reads assume the pristine fork tip; sibling test files may
// have mined on the shared instance.
beforeAll(async () => {
  await Actions.state.reset(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 30_000)

const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const storageKey =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

test('default', async () => {
  const proof = await Actions.address.getProof(client, {
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
      "balance": 2578764282569393454844437n,
      "codeHash": "0xd0a06b12ac47863b5c7be4185c2deaad1c61557033f56c7d4ea74429cbb25e23",
      "nonce": 1,
      "storageHash": "0x2d2a07b583c2832f472ba2bc37c01b5d645ceb56ffd958063ec310756703111d",
      "storageProofEntry": {
        "key": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "value": 39553310892875263560936207548857176834471854732421237974622739861269930573850n,
      },
    }
  `)
})

test('args: blockNumber', async () => {
  const proof = await Actions.address.getProof(client, {
    address: weth,
    blockNumber: anvil.mainnet.forkBlockNumber,
    storageKeys: [storageKey],
  })
  expect(typeof proof.balance).toBe('bigint')
  expect(typeof proof.nonce).toBe('number')
  expect(proof.accountProof.length).toBeGreaterThan(0)
})
