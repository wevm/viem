import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import {
  addLiquidity,
  getLpBalance,
  getPoolState,
  removeLiquidity,
} from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const feeAmm = '0xfeec000000000000000000000000000000000000'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const alphaUsd = '0x20c0000000000000000000000000000000000001'
const provider = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const providerKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const client = Client.create({
  account: Account.fromSecp256k1(providerKey),
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

function pad(address: string) {
  return address.slice(2).toLowerCase().padStart(64, '0')
}

async function call(to: string, data: string): Promise<string> {
  return await rpc('eth_call', [{ to, data }, 'latest'])
}

async function balanceOf(token: string, account: string) {
  return BigInt(await call(token, `0x70a08231${pad(account)}`))
}

// Directional pool (userToken=AlphaUSD, validatorToken=pathUSD).
let poolId: string

// getPool(address,address) -> (uint128 reserveUserToken, uint128 reserveValidatorToken)
async function reserves() {
  const data = await call(feeAmm, `0x531aa03e${pad(alphaUsd)}${pad(pathUsd)}`)
  return {
    user: BigInt(`0x${data.slice(2, 66)}`),
    validator: BigInt(`0x${data.slice(66, 130)}`),
  }
}

// totalSupply(bytes32)
async function totalSupply() {
  return BigInt(await call(feeAmm, `0xb524abcf${poolId.slice(2)}`))
}

// liquidityBalances(bytes32,address)
async function lpBalance(account: string) {
  return BigInt(
    await call(feeAmm, `0x4fb5bf7f${poolId.slice(2)}${pad(account)}`),
  )
}

beforeAll(async () => {
  // getPoolId(address,address)
  poolId = await call(feeAmm, `0x2ef61c21${pad(alphaUsd)}${pad(pathUsd)}`)

  // Dev account 0 holds faucet-seeded pathUSD at genesis; top up if not.
  if ((await balanceOf(pathUsd, provider)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [provider])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(pathUsd, provider)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('failed to fund dev account 0 with pathUSD')
}, 120_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('mints liquidity into the pool', async () => {
  const reservesBefore = await reserves()
  const supplyBefore = await totalSupply()
  const lpBefore = await lpBalance(provider)

  const first = await addLiquidity(client, {
    userToken: alphaUsd,
    validatorToken: pathUsd,
    validatorTokenAmount: 25_000_000n,
  })
  expect(first?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(first.receipt.status)
  expect(first.liquidity).toBeGreaterThan(0n)

  const lpMid = await lpBalance(provider)
  const reservesMid = await reserves()
  expect(lpMid).toBeGreaterThan(lpBefore)
  // Tx fees route through fee-AMM pools; allow fee-sized reserve drift.
  const firstDelta = reservesMid.validator - reservesBefore.validator
  expect(firstDelta).toBeGreaterThanOrEqual(24_950_000n)
  expect(firstDelta).toBeLessThanOrEqual(25_050_000n)
  const userDrift = reservesMid.user - reservesBefore.user
  expect(userDrift).toBeGreaterThanOrEqual(-50_000n)
  expect(userDrift).toBeLessThanOrEqual(50_000n)

  // Second deposit into a primed pool: LP shares issued match the balance delta.
  const second = await addLiquidity(client, {
    userToken: alphaUsd,
    validatorToken: pathUsd,
    validatorTokenAmount: 10_000_000n,
  })
  expect(['success', '0x1']).toContain(second.receipt.status)

  const lpAfter = await lpBalance(provider)
  const reservesAfter = await reserves()
  expect(second.liquidity).toBe(lpAfter - lpMid)
  expect(second.liquidity).toBeGreaterThan(0n)
  const secondDelta = reservesAfter.validator - reservesMid.validator
  expect(secondDelta).toBeGreaterThanOrEqual(9_950_000n)
  expect(secondDelta).toBeLessThanOrEqual(10_050_000n)
  expect(await totalSupply()).toBeGreaterThan(supplyBefore)
}, 120_000)

test('reads pool state and LP balance', async () => {
  const pool = await getPoolState(readClient, {
    userToken: alphaUsd,
    validatorToken: pathUsd,
  })
  const actual = await reserves()
  expect(pool.reserveUserToken).toBe(actual.user)
  expect(pool.reserveValidatorToken).toBe(actual.validator)
  expect(pool.totalSupply).toBe(await totalSupply())
  expect(pool.totalSupply).toBeGreaterThan(0n)

  const balance = await getLpBalance(readClient, {
    address: provider,
    userToken: alphaUsd,
    validatorToken: pathUsd,
  })
  expect(balance).toBe(await lpBalance(provider))
  expect(balance).toBeGreaterThan(0n)
}, 120_000)

test('burns the entire position', async () => {
  const lpBefore = await lpBalance(provider)
  expect(lpBefore).toBeGreaterThan(0n)
  const pathUsdBefore = await balanceOf(pathUsd, provider)
  const reservesBefore = await reserves()

  const result = await removeLiquidity(client, {
    userToken: alphaUsd,
    validatorToken: pathUsd,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)

  expect(await lpBalance(provider)).toBe(0n)
  const reservesAfter = await reserves()
  expect(reservesAfter.validator).toBeLessThan(reservesBefore.validator)
  // Withdrawn pathUSD dwarfs the pathUSD tx fee.
  expect(await balanceOf(pathUsd, provider)).toBeGreaterThan(pathUsdBefore)
}, 120_000)
