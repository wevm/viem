import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { client, sendParallelTransfers } from '../src/index.ts'

const sender = '0x90f79bf6eb2c4f870365e785982e1f101e93b906'
// History-free address: anvil dev accounts carry EIP-7702 sweeper delegations
// on real mainnet, so forked transfers to them are swept in the same tx.
const recipient = '0x4242424242424242424242424242424242424242'

async function rpc(method: string, params: unknown[]) {
  const res = await fetch('http://anvil:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new Error(error.message)
  return result
}

async function getReceipt(hash: string) {
  for (let i = 0; i < 150; i++) {
    const receipt = await rpc('eth_getTransactionReceipt', [hash])
    if (receipt) return receipt
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`no receipt for ${hash}`)
}

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('sends 5 concurrent transfers that all mine with consecutive nonces', async () => {
  const values = [
    1_000_000_000_000_000n,
    2_000_000_000_000_000n,
    3_000_000_000_000_000n,
    4_000_000_000_000_000n,
    5_000_000_000_000_000n,
  ]
  const startNonce = Number(
    await rpc('eth_getTransactionCount', [sender, 'latest']),
  )
  const balanceBefore = BigInt(
    await rpc('eth_getBalance', [recipient, 'latest']),
  )

  const hashes = await sendParallelTransfers(client, { to: recipient, values })

  expect(hashes).toHaveLength(5)
  expect(new Set(hashes).size).toBe(5)

  const receipts = await Promise.all(hashes.map(getReceipt))
  for (const receipt of receipts) expect(receipt.status).toBe('0x1')

  const txs = await Promise.all(
    hashes.map((hash) => rpc('eth_getTransactionByHash', [hash])),
  )
  for (const [i, tx] of txs.entries()) {
    expect(tx.from.toLowerCase()).toBe(sender)
    expect(tx.to.toLowerCase()).toBe(recipient)
    expect(BigInt(tx.value)).toBe(values[i])
  }

  const nonces = txs.map((tx) => Number(tx.nonce)).sort((a, b) => a - b)
  expect(nonces).toEqual([0, 1, 2, 3, 4].map((i) => startNonce + i))

  const balanceAfter = BigInt(
    await rpc('eth_getBalance', [recipient, 'latest']),
  )
  expect(balanceAfter - balanceBefore).toBe(15_000_000_000_000_000n)
}, 120_000)
