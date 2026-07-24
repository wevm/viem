import { readFileSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { sendPayment } from '../src/index.ts'

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

// Fixed fresh keys; setup pins balance and code so upstream state is irrelevant.
const poorKey =
  '0x5eba0000000000000000000000000000000000000000000000000000000e0a15'
const poorAddress = '0xa75ecd00106901c1c37447b2cd889326be03822b'
const richKey =
  '0x5eba0000000000000000000000000000000000000000000000000000000f00d5'
const richAddress = '0x701dc6864212b700915dd281d9ee0035ce358c04'
// History-free recipient (avoids EIP-7702 sweeper delegations on known EOAs).
const recipient = '0x4242424242424242424242424242424242424242'

const poorClient = Client.create({
  account: Account.fromPrivateKey(poorKey),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})
const richClient = Client.create({
  account: Account.fromPrivateKey(richKey),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/RpcError\.InsufficientFundsError/)
  expect(source).toMatch(/\.walk\(/)
  expect(source).not.toMatch(/\.message\b/)
}, 60_000)

test('classifies an overspend as insufficient-funds', async () => {
  await rpc('anvil_setBalance', [poorAddress, '0x0'])
  await rpc('anvil_setCode', [poorAddress, '0x'])
  const status = await sendPayment(poorClient, {
    amountEther: '1',
    to: recipient,
  })
  expectTypeOf(status).toEqualTypeOf<
    'insufficient-funds' | 'sent' | 'unknown'
  >()
  expect(status).toBe('insufficient-funds')
}, 60_000)

test('classifies a valid send as sent and delivers the funds', async () => {
  // 1000 ETH.
  await rpc('anvil_setBalance', [richAddress, '0x3635c9adc5dea00000'])
  await rpc('anvil_setCode', [richAddress, '0x'])
  await rpc('anvil_setBalance', [recipient, '0x0'])
  expect(
    await sendPayment(richClient, {
      amountEther: '1',
      to: recipient,
    }),
  ).toBe('sent')
  await rpc('evm_mine', [])
  const balance = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  expect(balance).toBe(1_000_000_000_000_000_000n)
}, 60_000)

test('classifies another failure as unknown', async () => {
  expect(
    await sendPayment(richClient, {
      amountEther: 'not-an-amount',
      to: recipient,
    }),
  ).toBe('unknown')
}, 60_000)
