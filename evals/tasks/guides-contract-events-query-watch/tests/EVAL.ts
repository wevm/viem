import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import type { Address } from 'viem/utils'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const source = readFileSync('src/index.ts', 'utf8')
const account = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const alice = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const bob = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
const token = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

async function balanceOf(address: Address.Address) {
  return (
    await Actions.token.getBalance(client, {
      account: address,
      token,
    })
  ).amount
}

test('exports a zero-input Viem example', () => {
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expect(source).toMatch(/Account\.fromPrivateKey/)
  expect(source).toMatch(/for\s+await/)
  expect(source).toMatch(/\.off\s*\(/)
  expect(source).not.toMatch(/impersonat/i)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('queries transfer history and resolves the next watched transfer', async () => {
  const [alice_before, bob_before, account_before] = await Promise.all([
    balanceOf(alice),
    balanceOf(bob),
    balanceOf(account),
  ])

  const result = await example()
  expect(result.history).toHaveLength(2)
  expect(result.history.map(({ to, value }) => ({ to, value }))).toEqual([
    { to: alice, value: 1_500_000n },
    { to: bob, value: 77_000n },
  ])
  expect(result.watched).toEqual({
    from: account,
    to: alice,
    value: 424_242n,
  })

  const [alice_after, bob_after, account_after] = await Promise.all([
    balanceOf(alice),
    balanceOf(bob),
    balanceOf(account),
  ])
  expect(alice_after).toBe(alice_before + 1_924_242n)
  expect(bob_after).toBe(bob_before + 77_000n)
  expect(account_after).toBe(
    account_before + 1_000_000_000_000_000_000n - 2_001_242n,
  )
}, 120_000)
