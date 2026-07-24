import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import { getChannelState, openChannel, topUpChannel } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const channelReserve = '0x4d50500000000000000000000000000000000000'
const payer = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const payerKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const payee = '0x4242424242424242424242424242424242424242'
const payee2 = '0x4343434343434343434343434343434343434343'
const client = Client.create({
  account: Account.fromSecp256k1(payerKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})
const readClient = Client.create({
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

async function balanceOf(account: string) {
  const data = `0x70a08231${account.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: pathUsd, data }, 'latest']))
}

// getChannelState(bytes32) on the TIP-20 channel reserve precompile.
async function channelState(channelId: string) {
  const data = `0xd18da8b1${channelId.slice(2).toLowerCase()}`
  const result: string = await rpc('eth_call', [
    { to: channelReserve, data },
    'latest',
  ])
  const word = (i: number) =>
    BigInt(`0x${result.slice(2 + i * 64, 66 + i * 64)}`)
  return { settled: word(0), deposit: word(1), closeRequestedAt: word(2) }
}

beforeAll(async () => {
  // Dev account 0 holds faucet-seeded pathUSD at genesis; top up if not.
  if ((await balanceOf(payer)) >= 200_000_000n) return
  await rpc('tempo_fundAddress', [payer])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(payer)) >= 200_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('failed to fund dev account 0 with pathUSD')
}, 120_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('opens a pathUSD channel, tops it up, and reads exact state', async () => {
  const reserveBefore = await balanceOf(channelReserve)

  const opened = await openChannel(client, { deposit: '100', payee })
  expect(opened?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(opened.receipt.status)
  expect(opened.channelId).toMatch(/^0x[0-9a-fA-F]{64}$/)
  expect(opened.channel?.payee?.toLowerCase()).toBe(payee.toLowerCase())
  expect(opened.channel?.token?.toLowerCase()).toBe(pathUsd)

  const afterOpen = await channelState(opened.channelId)
  expect(afterOpen.deposit).toBe(100_000_000n)
  expect(afterOpen.settled).toBe(0n)
  expect(afterOpen.closeRequestedAt).toBe(0n)

  const topUp = await topUpChannel(client, {
    additionalDeposit: '25.5',
    channel: opened.channel,
  })
  expect(topUp?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(topUp.receipt.status)

  // Funded amount is exactly open + top-up, and the channel is still open.
  const afterTopUp = await channelState(opened.channelId)
  expect(afterTopUp.deposit).toBe(125_500_000n)
  expect(afterTopUp.settled).toBe(0n)
  expect(afterTopUp.closeRequestedAt).toBe(0n)

  // The reserve holds exactly the deposited pathUSD.
  expect((await balanceOf(channelReserve)) - reserveBefore).toBe(125_500_000n)

  // The agent's own state read agrees with raw RPC.
  const state = await getChannelState(readClient, {
    channelId: opened.channelId,
  })
  expect(BigInt(state.deposit)).toBe(125_500_000n)
  expect(BigInt(state.settled)).toBe(0n)
  expect(Number(state.closeRequestedAt)).toBe(0)
}, 120_000)

test('opens a distinct channel for other amounts', async () => {
  const first = await openChannel(client, { deposit: '3.25', payee: payee2 })
  const second = await openChannel(client, { deposit: '1', payee: payee2 })
  expect(second.channelId).not.toBe(first.channelId)

  await topUpChannel(client, {
    additionalDeposit: '0.75',
    channel: first.channel,
  })

  const state = await channelState(first.channelId)
  expect(state.deposit).toBe(4_000_000n)
  expect(state.settled).toBe(0n)
  expect(state.closeRequestedAt).toBe(0n)

  const agentState = await getChannelState(readClient, {
    channelId: first.channelId,
  })
  expect(BigInt(agentState.deposit)).toBe(4_000_000n)
}, 120_000)
