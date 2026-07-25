import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const spender = '0x5151515151515151515151515151515151515151'
const recipient = '0x5252525252525252525252525252525252525252'

// keccak256("Transfer(address,address,uint256)") / "Approval(...)"
const transferTopic =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const approvalTopic =
  '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'

type Log = {
  address: string
  data: string
  topics: readonly string[]
}

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

function pad(address: string) {
  return `0x${address.slice(2).toLowerCase().padStart(64, '0')}`
}

async function balanceOf(account: string) {
  const data = `0x70a08231${pad(account).slice(2)}`
  return BigInt(await rpc('eth_call', [{ to: pathUsd, data }, 'latest']))
}

async function allowance(owner: string, spender: string) {
  const data = `0xdd62ed3e${pad(owner).slice(2)}${pad(spender).slice(2)}`
  return BigInt(await rpc('eth_call', [{ to: pathUsd, data }, 'latest']))
}

beforeAll(async () => {
  // Dev account 0 holds faucet-seeded pathUSD at genesis; top up if not.
  if ((await balanceOf(sender)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [sender])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(sender)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('failed to fund dev account 0 with pathUSD')
}, 120_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('approves and transfers pathUSD in one transaction', async () => {
  const before = await balanceOf(recipient)
  const receipt = await example()
  expect(['success', '0x1']).toContain(receipt.status)

  // Both effects visible on chain, exactly.
  expect(await allowance(sender, spender)).toBe(25_500_000n)
  expect((await balanceOf(recipient)) - before).toBe(10_500_000n)

  // Both effects landed in the single returned transaction.
  const hash = receipt.transactionHash
  expect(hash).toMatch(/^0x[0-9a-fA-F]{64}$/)
  const raw = (await rpc('eth_getTransactionReceipt', [hash])) as {
    logs: readonly Log[]
  }
  const logs = raw.logs.filter((log) => log.address.toLowerCase() === pathUsd)
  const approval = logs.find(
    (log) =>
      log.topics[0] === approvalTopic &&
      log.topics[1]?.toLowerCase() === pad(sender) &&
      log.topics[2]?.toLowerCase() === pad(spender),
  )
  if (!approval) throw new Error('Approval log missing from transaction')
  expect(BigInt(approval.data)).toBe(25_500_000n)
  const transfer = logs.find(
    (log) =>
      log.topics[0] === transferTopic &&
      log.topics[1]?.toLowerCase() === pad(sender) &&
      log.topics[2]?.toLowerCase() === pad(recipient),
  )
  if (!transfer) throw new Error('Transfer log missing from transaction')
  expect(BigInt(transfer.data)).toBe(10_500_000n)
}, 120_000)
