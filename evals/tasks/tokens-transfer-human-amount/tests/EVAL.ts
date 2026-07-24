import { readFileSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { transferUsdc } from '../src/index.ts'

const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60' // Binance 14
const sender = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' // dev account 2
// History-free address: no code, no EIP-7702 delegation at the fork block.
const recipient = '0x4242424242424242424242424242424242424242'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
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

function pad(value: string | bigint) {
  const hex = typeof value === 'bigint' ? value.toString(16) : value.slice(2)
  return hex.toLowerCase().padStart(64, '0')
}

async function balanceOf(address: string): Promise<bigint> {
  return BigInt(
    await rpc('eth_call', [
      { to: usdcAddress, data: `0x70a08231${pad(address)}` },
      'latest',
    ]),
  )
}

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('transfers exactly 1.5 USDC from the sender to the recipient', async () => {
  // Seed the sender with 10 USDC from an impersonated whale.
  await rpc('anvil_setBalance', [whale, '0x8ac7230489e80000'])
  await rpc('anvil_impersonateAccount', [whale])
  await rpc('eth_sendTransaction', [
    {
      from: whale,
      to: usdcAddress,
      data: `0xa9059cbb${pad(sender)}${pad(10_000_000n)}`,
    },
  ])
  await rpc('anvil_stopImpersonatingAccount', [whale])

  const senderBefore = await balanceOf(sender)
  const recipientBefore = await balanceOf(recipient)
  expect(senderBefore).toBeGreaterThanOrEqual(10_000_000n)

  const receipt = (await transferUsdc(client, {
    amount: '1.5',
    to: recipient,
  })) as { status?: unknown }
  expect(receipt.status).toBe('success')

  expect((await balanceOf(recipient)) - recipientBefore).toBe(1_500_000n)
  expect(senderBefore - (await balanceOf(sender))).toBe(1_500_000n)
}, 60_000)
