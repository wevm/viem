import { readFileSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { beforeAll, expect, test } from 'vitest'
import {
  approveUsdcSpender,
  getUsdcAllowance,
  spendUsdcAllowance,
} from '../src/index.ts'

const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'

const owner = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const spender = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
const recipient = '0x90F79bf6EB2c4f870365E785982E1f101E93b906'

const ownerClient = Client.create({
  account: Account.fromPrivateKey(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})
const spenderClient = Client.create({
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

function word(value: string | bigint) {
  const hex =
    typeof value === 'bigint'
      ? value.toString(16)
      : value.toLowerCase().slice(2)
  return hex.padStart(64, '0')
}

async function usdcCall(data: string) {
  return BigInt(await rpc('eth_call', [{ to: usdcAddress, data }, 'latest']))
}

// balanceOf(address)
const balanceOf = (account: string) => usdcCall(`0x70a08231${word(account)}`)
// allowance(address,address)
const allowance = (o: string, s: string) =>
  usdcCall(`0xdd62ed3e${word(o)}${word(s)}`)

beforeAll(async () => {
  // Seed the owner with 50 USDC from a mainnet whale.
  await rpc('anvil_setBalance', [whale, '0xde0b6b3a7640000'])
  await rpc('anvil_impersonateAccount', [whale])
  await rpc('eth_sendTransaction', [
    {
      from: whale,
      to: usdcAddress,
      data: `0xa9059cbb${word(owner)}${word(50_000_000n)}`,
    },
  ])
  await rpc('anvil_stopImpersonatingAccount', [whale])
}, 60_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('approves, reads, and spends the allowance', async () => {
  const ownerBefore = await balanceOf(owner)
  const recipientBefore = await balanceOf(recipient)
  expect(ownerBefore).toBeGreaterThanOrEqual(50_000_000n)

  await approveUsdcSpender(ownerClient, {
    amount: 25_000_000n,
    spender,
  })
  expect(await allowance(owner, spender)).toBe(25_000_000n)
  expect(
    await getUsdcAllowance(ownerClient, {
      owner,
      spender,
    }),
  ).toBe(25_000_000n)

  await spendUsdcAllowance(spenderClient, {
    amount: 10_000_000n,
    owner,
    recipient,
  })
  expect(await allowance(owner, spender)).toBe(15_000_000n)
  expect(
    await getUsdcAllowance(ownerClient, {
      owner,
      spender,
    }),
  ).toBe(15_000_000n)
  expect(await balanceOf(owner)).toBe(ownerBefore - 10_000_000n)
  expect(await balanceOf(recipient)).toBe(recipientBefore + 10_000_000n)
}, 120_000)
