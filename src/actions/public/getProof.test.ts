import { describe, expect, test } from 'vp/test'

import { Client, http } from 'viem'
import * as actions from 'viem/actions'
import { Hex } from 'viem/utils'
import { anvilMainnet, request } from '../../../test/anvil.js'

const address = '0x0000000000000000000000000000000000000001'
const slot =
  '0x0000000000000000000000000000000000000000000000000000000000000000'
const value =
  '0x000000000000000000000000000000000000000000000000000000000000002a'

describe('getProof', () => {
  test('behavior: returns the account and storage proof', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    await request(anvilMainnet, 'anvil_setStorageAt', [address, slot, value])

    const proof = await actions.getProof(client, {
      address,
      storageKeys: [slot],
    })

    expect({
      address: proof.address,
      balance: typeof proof.balance,
      nonce: typeof proof.nonce,
      codeHash: typeof proof.codeHash,
      storageHash: typeof proof.storageHash,
      accountProof: Array.isArray(proof.accountProof),
      storageProof: proof.storageProof.map((p) => ({
        key: p.key,
        value: p.value,
      })),
    }).toMatchInlineSnapshot(`
      {
        "accountProof": true,
        "address": "0x0000000000000000000000000000000000000001",
        "balance": "bigint",
        "codeHash": "string",
        "nonce": "number",
        "storageHash": "string",
        "storageProof": [
          {
            "key": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "value": 42n,
          },
        ],
      }
    `)
  })

  test('behavior: accepts a block number', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const blockNumberHex = await request<Hex.Hex>(
      anvilMainnet,
      'eth_blockNumber',
    )
    const blockNumber = Hex.toBigInt(blockNumberHex)

    const proof = await actions.getProof(client, {
      address,
      blockNumber,
      storageKeys: [],
    })

    expect(proof.address.toLowerCase()).toBe(address)
  })

  test('behavior: accepts a block hash with requireCanonical', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const block = await request<{ hash: Hex.Hex }>(
      anvilMainnet,
      'eth_getBlockByNumber',
      ['latest', false],
    )

    const proof = await actions.getProof(client, {
      address,
      blockHash: block.hash,
      requireCanonical: true,
      storageKeys: [],
    })

    expect(proof.address.toLowerCase()).toBe(address)
  })

  test('behavior: rejects requireCanonical without blockHash', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    await expect(
      actions.getProof(client, {
        address,
        // @ts-expect-error invalid combination
        requireCanonical: true,
        storageKeys: [],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [actions.public.InvalidBlockIdentifierError: \`requireCanonical\` can only be provided when \`blockHash\` is set.

      Version: viem@2.49.3]
    `)
  })
})
