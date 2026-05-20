import { describe, expect, test } from 'vp/test'

import { anvilMainnet, request } from '../../../test/anvil.js'
import { Client, http } from 'viem'
import * as actions from 'viem/actions'
import { Hex } from 'viem/utils'

describe('getBlockTransactionCount', () => {
  test('behavior: returns the transaction count by block number and hash', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })
    const receipt = await mineTransaction()
    const blockNumber = Hex.toBigInt(receipt.blockNumber)

    expect({
      blockHash: await actions.getBlockTransactionCount(client, {
        blockHash: receipt.blockHash,
      }),
      blockNumber: await actions.getBlockTransactionCount(client, {
        blockNumber,
      }),
    }).toMatchInlineSnapshot(`
      {
        "blockHash": 1n,
        "blockNumber": 1n,
      }
    `)
  })

  test('behavior: returns the latest block transaction count by default', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const count = await actions.getBlockTransactionCount(client)

    expect(typeof count).toMatchInlineSnapshot(`"bigint"`)
  })
})

async function mineTransaction() {
  const [from, to] = await request<readonly Hex.Hex[]>(
    anvilMainnet,
    'eth_accounts',
  )
  const transactionHash = await request<Hex.Hex>(
    anvilMainnet,
    'eth_sendTransaction',
    [{ from, gas: '0x5208', to, value: '0x1' }],
  )
  return request<{
    blockHash: Hex.Hex
    blockNumber: Hex.Hex
  }>(anvilMainnet, 'eth_getTransactionReceipt', [transactionHash])
}
