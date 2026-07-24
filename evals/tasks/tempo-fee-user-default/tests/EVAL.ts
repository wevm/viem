import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { Actions } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions as TempoActions, Client, http } from 'viem/tempo'
import {
  getDefaultFeeToken,
  setDefaultFeeToken,
  transferWithDefaultFee,
} from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const alphaUsd = '0x20c0000000000000000000000000000000000001'
// Fee manager / fee AMM precompile.
const feeManager = '0xfeec000000000000000000000000000000000000'
const dev0 = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const dev0Key =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
// Non-dev account the grader exercises end to end (unknown to the agent).
const userKey =
  '0x1111111111111111111111111111111111111111111111111111111111111111'
const user = '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A'
const recipient = '0x4545454545454545454545454545454545454545'
const dev0Client = Client.create({
  account: Account.fromSecp256k1(dev0Key),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})
const userClient = Client.create({
  account: Account.fromSecp256k1(userKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})

const feeAmmAbi = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'userToken' },
      { type: 'address', name: 'validatorToken' },
      { type: 'uint256', name: 'validatorTokenAmount' },
      { type: 'address', name: 'to' },
    ],
    outputs: [],
  },
] as const

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

beforeAll(async () => {
  // Dev account 0 holds faucet-seeded pathUSD at genesis; top up if not.
  if ((await balanceOf(pathUsd, dev0)) < 100_000_000n) {
    await rpc('tempo_fundAddress', [dev0])
    for (let i = 0; i < 300; i++) {
      if ((await balanceOf(pathUsd, dev0)) >= 100_000_000n) break
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    if ((await balanceOf(pathUsd, dev0)) < 100_000_000n)
      throw new Error('failed to fund dev account 0 with pathUSD')
  }

  // AlphaUSD is only a usable fee token once the fee AMM has liquidity for it.
  await Actions.contract.writeSync(dev0Client, {
    abi: feeAmmAbi,
    address: feeManager,
    args: [alphaUsd, pathUsd, 1_000_000_000n, dev0],
    feeToken: pathUsd,
    functionName: 'mint',
    nonceKey: (1n << 255n) + 77n,
  } as never)

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

  // Funding may preset a fee-token preference; normalize away from AlphaUSD
  // so the agent's set function is what puts AlphaUSD on chain.
  if ((await userTokenOf(user)) === alphaUsd)
    await TempoActions.fee.setUserTokenSync(userClient, {
      feeToken: pathUsd,
      token: pathUsd,
    })
}, 240_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('sets AlphaUSD as the account default fee token', async () => {
  expect(await userTokenOf(user)).not.toBe(alphaUsd)
  const result = await setDefaultFeeToken(userClient, { token: alphaUsd })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect(await userTokenOf(user)).toBe(alphaUsd)
}, 120_000)

test('reads the default fee token back', async () => {
  expect(String(await getDefaultFeeToken(userClient)).toLowerCase()).toBe(
    alphaUsd,
  )
}, 120_000)

test('pays the fee from the default token on a transfer', async () => {
  const [senderPathBefore, senderAlphaBefore, recipientBefore] =
    await Promise.all([
      balanceOf(pathUsd, user),
      balanceOf(alphaUsd, user),
      balanceOf(pathUsd, recipient),
    ])

  const result = await transferWithDefaultFee(userClient, {
    amount: '5',
    to: recipient,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)

  const [senderPathAfter, senderAlphaAfter, recipientAfter] = await Promise.all(
    [
      balanceOf(pathUsd, user),
      balanceOf(alphaUsd, user),
      balanceOf(pathUsd, recipient),
    ],
  )

  // Exact pathUSD deltas on both sides: the fee did not come from pathUSD.
  expect(recipientAfter - recipientBefore).toBe(5_000_000n)
  expect(senderPathBefore - senderPathAfter).toBe(5_000_000n)
  // The fee was debited from the AlphaUSD default.
  expect(senderAlphaBefore - senderAlphaAfter).toBeGreaterThan(0n)
}, 120_000)
