import { readFileSync } from 'node:fs'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Client, http } from 'viem/tempo'
import type { Address } from 'viem/utils'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const alphaUsd = '0x20c0000000000000000000000000000000000001'
const dev0 = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const user = '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A'
const recipient = '0x4545454545454545454545454545454545454545'
const client = Client.create({
  account: Account.fromSecp256k1(
    '0x1111111111111111111111111111111111111111111111111111111111111111',
  ),
  chain: tempoLocalnet,
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

async function balanceOf(
  token: Address.Address,
  account: Address.Address,
  blockNumber?: bigint,
) {
  const { amount } = await Actions.token.getBalance(client, {
    account,
    token,
    ...(blockNumber === undefined ? {} : { blockNumber }),
  })
  return amount
}

async function userTokenOf(account: Address.Address) {
  return Actions.fee.getUserToken(client, { account })
}

beforeAll(async () => {
  // Dev account 0 holds faucet-seeded pathUSD at genesis; top up if not.
  if ((await balanceOf(pathUsd, dev0)) < 2_000_000_000n) {
    await rpc('tempo_fundAddress', [dev0])
    for (let i = 0; i < 300; i++) {
      if ((await balanceOf(pathUsd, dev0)) >= 2_000_000_000n) break
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    if ((await balanceOf(pathUsd, dev0)) < 2_000_000_000n)
      throw new Error('failed to fund dev account 0 with pathUSD')
  }

  // Fund the graded account with the faucet tokens (pathUSD, AlphaUSD, ...).
  await rpc('tempo_fundAddress', [user])
  for (let i = 0; i < 300; i++) {
    if (
      (await balanceOf(pathUsd, user)) >= 100_000_000n &&
      (await balanceOf(alphaUsd, user)) >= 100_000_000n
    )
      break
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  if (
    (await balanceOf(pathUsd, user)) < 100_000_000n ||
    (await balanceOf(alphaUsd, user)) < 100_000_000n
  )
    throw new Error('failed to fund the graded account')

  if ((await userTokenOf(user))?.toLowerCase() === alphaUsd)
    await Actions.fee.setUserTokenSync(client, {
      feeToken: pathUsd,
      token: pathUsd,
    })
}, 240_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  const transfer = source.slice(source.indexOf('Actions.token.transferSync'))
  expect(transfer).not.toMatch(/\bfeeToken\s*:/)
}, 60_000)

test('pays the fee from the default token on a transfer', async () => {
  expect((await userTokenOf(user))?.toLowerCase()).not.toBe(alphaUsd)
  const recipientBefore = await balanceOf(pathUsd, recipient)

  const result = await example()
  expect(['success', '0x1']).toContain(result.preference.receipt.status)
  expect(['success', '0x1']).toContain(result.transfer.receipt.status)
  expect(result.preference.receipt.blockNumber).toBeLessThan(
    result.transfer.receipt.blockNumber,
  )
  expect(String(result.token).toLowerCase()).toBe(alphaUsd)
  expect((await userTokenOf(user))?.toLowerCase()).toBe(alphaUsd)

  const [
    senderPathBefore,
    senderAlphaBefore,
    senderPathAfter,
    senderAlphaAfter,
  ] = await Promise.all([
    balanceOf(pathUsd, user, result.preference.receipt.blockNumber),
    balanceOf(alphaUsd, user, result.preference.receipt.blockNumber),
    balanceOf(pathUsd, user),
    balanceOf(alphaUsd, user),
  ])

  expect((await balanceOf(pathUsd, recipient)) - recipientBefore).toBe(
    5_000_000n,
  )
  expect(senderPathBefore - senderPathAfter).toBe(5_000_000n)
  expect(senderAlphaBefore - senderAlphaAfter).toBeGreaterThan(0n)
}, 120_000)
