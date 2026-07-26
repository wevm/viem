import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import type { Address } from 'viem/utils'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const source = readFileSync('src/index.ts', 'utf8')
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const recipient = '0x4242424242424242424242424242424242424242'
const token = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

async function balanceOf(account: Address.Address) {
  return (await Actions.token.getBalance(client, { account, token })).amount
}

test('exports a zero-input Viem example', () => {
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/\bActions\.token\.transfer\.simulate\s*\(/)
  expect(source).toMatch(
    /\bActions\.transaction\.sendSync\s*\(\s*\w*[Cc]lient\s*,\s*request\s*\)/,
  )
  expect(source).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expect(source).toMatch(/Account\.fromPrivateKey/)
  expect(source).not.toMatch(/impersonat/i)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('simulates and submits the WETH transfer', async () => {
  const [sender_before, recipient_before] = await Promise.all([
    balanceOf(sender),
    balanceOf(recipient),
  ])

  const result = await example()

  expect(result.simulated).toBe(true)
  expect(result.receipt.status).toBe('success')
  expect(result.receipt.from.toLowerCase()).toBe(sender.toLowerCase())
  expect(result.receipt.to?.toLowerCase()).toBe(token.toLowerCase())
  expect(result.amount).toBe(12_345_678n)
  expect(result.to.toLowerCase()).toBe(recipient.toLowerCase())
  expect(result.token.toLowerCase()).toBe(token.toLowerCase())

  const [sender_after, recipient_after] = await Promise.all([
    balanceOf(sender),
    balanceOf(recipient),
  ])
  expect(sender_after).toBe(
    sender_before + 1_000_000_000_000_000_000n - result.amount,
  )
  expect(recipient_after).toBe(recipient_before + result.amount)
}, 120_000)
