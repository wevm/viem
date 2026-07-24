import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Client, http } from 'viem/tempo'
import { openChannel, settleVoucher } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const alphaUsd = '0x20c0000000000000000000000000000000000001'
// Fee manager / fee AMM precompile.
const feeManager = '0xfeec000000000000000000000000000000000000'
const payer = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const payerKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const payee = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const payeeKey =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
const payerAccount = Account.fromSecp256k1(payerKey)
const payerClient = Client.create({
  account: payerAccount,
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})
const payeeClient = Client.create({
  account: Account.fromSecp256k1(payeeKey),
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

// feeManager.userTokens(address), lowercased; zero address when unset.
async function userTokenOf(account: string) {
  const data = `0xed498fa8${account.slice(2).toLowerCase().padStart(64, '0')}`
  const result = (await rpc('eth_call', [
    { to: feeManager, data },
    'latest',
  ])) as string
  return `0x${result.slice(-40)}`.toLowerCase()
}

async function fund(account: string) {
  const pathBefore = await balanceOf(pathUsd, account)
  const alphaBefore = await balanceOf(alphaUsd, account)
  await rpc('tempo_fundAddress', [account])
  // The faucet grants each token; wait for both so no grant lands mid-test.
  for (let i = 0; i < 300; i++) {
    const [path, alpha] = await Promise.all([
      balanceOf(pathUsd, account),
      balanceOf(alphaUsd, account),
    ])
    if (path > pathBefore && alpha > alphaBefore) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`failed to fund ${account} with pathUSD and AlphaUSD`)
}

beforeAll(async () => {
  // Dev account 0 holds faucet-seeded pathUSD + AlphaUSD at genesis; the
  // AlphaUSD headroom covers the channel deposits, pathUSD covers fees.
  if (
    (await balanceOf(pathUsd, payer)) < 10_000_000_000n ||
    (await balanceOf(alphaUsd, payer)) < 500_000_000n
  )
    await fund(payer)
  // The payee pays the settle transaction fees in pathUSD.
  if ((await balanceOf(pathUsd, payee)) < 50_000_000n) await fund(payee)

  // Faucet funding may preset a non-pathUSD fee-token preference; normalize
  // so settle fees never debit the payee's AlphaUSD balance.
  if ((await userTokenOf(payee)) !== pathUsd)
    await Actions.fee.setUserTokenSync(payeeClient, {
      feeToken: pathUsd,
      token: pathUsd,
    })
}, 240_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('payee settles a signed voucher for part of the deposit', async () => {
  const { channel } = await openChannel(payerClient, {
    deposit: '100',
    payee,
  })
  expect(channel).toBeTruthy()

  const before = await balanceOf(alphaUsd, payee)
  const result = await settleVoucher(payeeClient, {
    amount: '32.5',
    channel,
    payer: payerAccount,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect((await balanceOf(alphaUsd, payee)) - before).toBe(32_500_000n)
}, 120_000)

test('settles an exact base-unit amount on a second channel', async () => {
  const { channel } = await openChannel(payerClient, {
    deposit: '10',
    payee,
  })

  const before = await balanceOf(alphaUsd, payee)
  await settleVoucher(payeeClient, {
    amount: '0.75',
    channel,
    payer: payerAccount,
  })
  expect((await balanceOf(alphaUsd, payee)) - before).toBe(750_000n)
}, 120_000)
