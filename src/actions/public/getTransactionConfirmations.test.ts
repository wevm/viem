import { describe, expect, test } from 'vp/test'

import { anvilMainnet, request } from '../../../test/anvil.js'
import { Client, http } from 'viem'
import * as actions from 'viem/actions'
import { Hex } from 'viem/utils'

describe('getTransactionConfirmations', () => {
  test('behavior: returns confirmations for a mined transaction by hash', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })
    const transactionHash = await mineTransaction()
    await request(anvilMainnet, 'anvil_mine', ['0x4'])

    const confirmations = await actions.getTransactionConfirmations(client, {
      hash: transactionHash,
    })

    expect(confirmations).toBeGreaterThanOrEqual(5n)
  })

  test('behavior: returns confirmations from a transaction receipt', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })
    const transactionHash = await mineTransaction()
    const receipt = await actions.getTransactionReceipt(client, {
      hash: transactionHash,
    })
    await request(anvilMainnet, 'anvil_mine', ['0x4'])

    const confirmations = await actions.getTransactionConfirmations(client, {
      transactionReceipt: receipt,
    })

    expect(confirmations).toBeGreaterThanOrEqual(5n)
  })

  test('behavior: returns 0n when the transaction has no block number', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    // Pending receipt-like object (no block number).
    const confirmations = await actions.getTransactionConfirmations(client, {
      transactionReceipt: { blockNumber: null } as any,
    })

    expect(confirmations).toBe(0n)
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
  await request(anvilMainnet, 'anvil_mine', ['0x1'])
  return transactionHash
}
