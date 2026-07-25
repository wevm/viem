import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const feeAmm = '0xfeec000000000000000000000000000000000000'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const alphaUsd = '0x20c0000000000000000000000000000000000001'
const provider = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

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

let poolId: string

async function reserves() {
  const data = await call(feeAmm, `0x531aa03e${pad(alphaUsd)}${pad(pathUsd)}`)
  return {
    user: BigInt(`0x${data.slice(2, 66)}`),
    validator: BigInt(`0x${data.slice(66, 130)}`),
  }
}

async function totalSupply() {
  return BigInt(await call(feeAmm, `0xb524abcf${poolId.slice(2)}`))
}

async function lpBalance(account: string) {
  return BigInt(
    await call(feeAmm, `0x4fb5bf7f${poolId.slice(2)}${pad(account)}`),
  )
}

beforeAll(async () => {
  poolId = await call(feeAmm, `0x2ef61c21${pad(alphaUsd)}${pad(pathUsd)}`)
  if ((await balanceOf(pathUsd, provider)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [provider])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(pathUsd, provider)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('failed to fund dev account 0 with pathUSD')
}, 120_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('mints, reads, and burns a complete liquidity position', async () => {
  const result = await example()

  expect(['success', '0x1']).toContain(result.first.receipt.status)
  expect(['success', '0x1']).toContain(result.second.receipt.status)
  expect(['success', '0x1']).toContain(result.burn.receipt.status)
  expect(result.first.amountValidatorToken).toBe(25_000_000n)
  expect(result.second.amountValidatorToken).toBe(10_000_000n)
  expect(result.first.liquidity).toBeGreaterThan(0n)
  expect(result.second.liquidity).toBeGreaterThan(0n)
  expect(result.liquidityBeforeBurn).toBeGreaterThanOrEqual(
    result.first.liquidity + result.second.liquidity,
  )
  expect(result.burn.liquidity).toBe(result.liquidityBeforeBurn)
  expect(result.poolBeforeBurn.reserveValidatorToken).toBeGreaterThan(
    result.poolAfterBurn.reserveValidatorToken,
  )
  expect(result.liquidityAfterBurn).toBe(0n)

  const actual = await reserves()
  expect(result.poolAfterBurn.reserveUserToken).toBe(actual.user)
  expect(result.poolAfterBurn.reserveValidatorToken).toBe(actual.validator)
  expect(result.poolAfterBurn.totalSupply).toBe(await totalSupply())
  expect(await lpBalance(provider)).toBe(0n)
}, 120_000)
