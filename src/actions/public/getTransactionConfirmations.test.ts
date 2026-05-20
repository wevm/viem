import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import type { Hex } from 'viem/utils'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

describe('getTransactionConfirmations', () => {
  test('behavior: returns confirmations for a mined transaction by hash', async () => {
    const client = anvil.getClient(anvilMainnet)
    const transactionHash = await mineTransaction(client)
    await actions.mine(client, { blocks: 4n })

    const confirmations = await actions.getTransactionConfirmations(client, {
      hash: transactionHash,
    })

    expect(confirmations).toBeGreaterThanOrEqual(5n)
  })

  test('behavior: returns confirmations from a transaction receipt', async () => {
    const client = anvil.getClient(anvilMainnet)
    const transactionHash = await mineTransaction(client)
    const receipt = await actions.getTransactionReceipt(client, {
      hash: transactionHash,
    })
    await actions.mine(client, { blocks: 4n })

    const confirmations = await actions.getTransactionConfirmations(client, {
      transactionReceipt: receipt,
    })

    expect(confirmations).toBeGreaterThanOrEqual(5n)
  })

  test('behavior: returns 0n when the transaction has no block number', async () => {
    const client = anvil.getClient(anvilMainnet)

    // Pending receipt-like object (no block number).
    const confirmations = await actions.getTransactionConfirmations(client, {
      transactionReceipt: { blockNumber: null } as any,
    })

    expect(confirmations).toBe(0n)
  })
})

async function mineTransaction(
  client: ReturnType<typeof anvil.getClient>,
): Promise<Hex.Hex> {
  // Wallet actions (`eth_accounts`, `eth_sendTransaction`) aren't wired up
  // yet; fall through to the client's RPC layer until `actions.wallet` lands.
  const [from, to] = await client.request({ method: 'eth_accounts' })
  const transactionHash = await client.request({
    method: 'eth_sendTransaction',
    params: [{ from, gas: '0x5208', to, value: '0x1' }],
  })
  await actions.mine(client, { blocks: 1n })
  return transactionHash
}
