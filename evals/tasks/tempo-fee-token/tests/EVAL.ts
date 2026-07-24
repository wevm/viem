import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import { transferToken } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const alphaUsd = '0x20c0000000000000000000000000000000000001'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const senderKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const recipient = '0x4242424242424242424242424242424242424242'
const client = Client.create({
  account: Account.fromSecp256k1(senderKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new Error(error.message)
  return result
}

async function balanceOf(token: string, account: string) {
  const data = `0x70a08231${account.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: token, data }, 'latest']))
}

beforeAll(async () => {
  // Dev account 0 holds faucet-seeded pathUSD + AlphaUSD at genesis; top up
  // if not. The pathUSD headroom covers the transfer plus the fee-AMM deposit.
  const funded = async () =>
    (await balanceOf(pathUsd, sender)) >= 10_000_000_000n &&
    (await balanceOf(alphaUsd, sender)) >= 100_000_000n
  if (await funded()) return
  await rpc('tempo_fundAddress', [sender])
  for (let i = 0; i < 300; i++) {
    if (await funded()) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('failed to fund dev account 0 with pathUSD and AlphaUSD')
}, 120_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('transfers 12.5 pathUSD with the fee debited in AlphaUSD', async () => {
  const recipientBefore = await balanceOf(pathUsd, recipient)
  const senderAlphaBefore = await balanceOf(alphaUsd, sender)

  const result = await transferToken(client, {
    amount: '12.5',
    to: recipient,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)

  // pathUSD transfer amount lands exactly.
  expect((await balanceOf(pathUsd, recipient)) - recipientBefore).toBe(
    12_500_000n,
  )
  // The transfer moves no AlphaUSD, so any sender decrease is the fee debit.
  expect(
    senderAlphaBefore - (await balanceOf(alphaUsd, sender)),
  ).toBeGreaterThan(0n)
  // The AlphaUSD debit is a fee, not a transfer to the recipient.
  expect(await balanceOf(alphaUsd, recipient)).toBe(0n)
}, 120_000)
