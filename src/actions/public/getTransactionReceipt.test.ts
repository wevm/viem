import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import type { Hex } from 'viem/utils'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

describe('getTransactionReceipt', () => {
  test('behavior: fetches a receipt by hash', async () => {
    const client = anvil.getClient(anvilMainnet)
    const transactionHash = await mineTransaction(client)

    const receipt = await actions.getTransactionReceipt(client, {
      hash: transactionHash,
    })

    expect({
      hash: receipt.transactionHash,
      status: receipt.status,
      type: receipt.type,
    }).toMatchObject({
      hash: transactionHash,
      status: 'success',
      type: 'eip1559',
    })
  })

  test('behavior: throws when the receipt is not found', async () => {
    const client = anvil.getClient(anvilMainnet)

    await expect(
      actions.getTransactionReceipt(client, {
        hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      }),
    ).rejects.toMatchObject({
      name: 'actions.public.TransactionReceiptNotFoundError',
      shortMessage:
        'Transaction receipt with hash "0x0000000000000000000000000000000000000000000000000000000000000000" could not be found. The Transaction may not be processed on a block yet.',
    })
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
