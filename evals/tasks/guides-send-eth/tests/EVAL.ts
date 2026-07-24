import { readFileSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { sendEth } from '../src/index.ts'

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

const sender = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// History-free address: no code, no prior balance at the pinned fork block.
const recipient = '0x4242424242424242424242424242424242424242'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('sends eth, waits for confirmation, and returns a successful receipt', async () => {
  const before = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  const receipt = await sendEth(client, {
    amountEther: '1.5',
    to: recipient,
  })

  expect(receipt.status).toBe('success')

  // Recipient received exactly 1.5 ETH (asserted via raw RPC).
  const after = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  expect(after - before).toBe(1_500_000_000_000_000_000n)

  // The returned receipt corresponds to a real mined transaction.
  const raw = await rpc('eth_getTransactionReceipt', [receipt.transactionHash])
  expect(raw.status).toBe('0x1')
  expect(raw.from).toBe(sender)
  expect(raw.to).toBe(recipient)
}, 60_000)
