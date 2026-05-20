import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import type { Hex } from 'viem/utils'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

describe('getBlockTransactionCount', () => {
  test('behavior: returns the transaction count by block number and hash', async () => {
    const client = anvil.getClient(anvilMainnet)
    const transactionHash = await mineTransaction(client)
    const receipt = await actions.getTransactionReceipt(client, {
      hash: transactionHash,
    })

    expect({
      blockHash: await actions.getBlockTransactionCount(client, {
        blockHash: receipt.blockHash,
      }),
      blockNumber: await actions.getBlockTransactionCount(client, {
        blockNumber: receipt.blockNumber,
      }),
    }).toMatchInlineSnapshot(`
      {
        "blockHash": 1n,
        "blockNumber": 1n,
      }
    `)
  })

  test('behavior: returns the latest block transaction count by default', async () => {
    const client = anvil.getClient(anvilMainnet)

    const count = await actions.getBlockTransactionCount(client)

    expect(typeof count).toMatchInlineSnapshot(`"bigint"`)
  })
})

async function mineTransaction(
  client: ReturnType<typeof anvil.getClient>,
): Promise<Hex.Hex> {
  // Wallet actions (`eth_accounts`, `eth_sendTransaction`) aren't wired up
  // yet; fall through to the client's RPC layer until `actions.wallet` lands.
  const [from, to] = await client.request({ method: 'eth_accounts' })
  return client.request({
    method: 'eth_sendTransaction',
    params: [{ from, gas: '0x5208', to, value: '0x1' }],
  })
}
