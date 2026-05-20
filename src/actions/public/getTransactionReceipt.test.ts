import { describe, expect, test } from 'vp/test'

import { anvilMainnet, request } from '../../../test/anvil.js'
import { Client, http } from 'viem'
import * as actions from 'viem/actions'
import { Hex } from 'viem/utils'

describe('getTransactionReceipt', () => {
  test('behavior: fetches a receipt by hash', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })
    const transactionHash = await mineTransaction()

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
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

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

async function mineTransaction() {
  const [from, to] = await request<readonly Hex.Hex[]>(
    anvilMainnet,
    'eth_accounts',
  )
  return request<Hex.Hex>(anvilMainnet, 'eth_sendTransaction', [
    { from, gas: '0x5208', to, value: '0x1' },
  ])
}
