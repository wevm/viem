import { readFileSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { sendRawPayment } from '../src/index.ts'

const sender = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// History-free address: anvil dev accounts carry EIP-7702 sweeper delegations
// on real mainnet, so forked transfers to them are swept in the same tx.
const recipient = '0x4242424242424242424242424242424242424242'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

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

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('signs locally and broadcasts the raw transaction', async () => {
  const before = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))

  const { hash, receipt } = await sendRawPayment(client, {
    amountEther: '1',
    to: recipient,
  })

  expect(hash).toMatch(/^0x[0-9a-f]{64}$/)
  expect(receipt.status).toBe('success')

  // The recovered sender of the mined transaction is the offline account.
  const transaction = await rpc('eth_getTransactionByHash', [hash])
  expect((transaction.from as string).toLowerCase()).toBe(sender)

  const after = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  expect(after - before).toBe(10n ** 18n)
}, 60_000)
