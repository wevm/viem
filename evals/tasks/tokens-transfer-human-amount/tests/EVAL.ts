import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sender = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
const recipient = '0x4242424242424242424242424242424242424242'
const token = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/decimals\s*:\s*18/)
  expect(source).toMatch(/formatted\s*:\s*['"]1\.5['"]/)
  expect(source).not.toMatch(/impersonat/i)
}, 60_000)

test('transfers exactly 1.5 WETH', async () => {
  const [sender_before, recipient_before] = await Promise.all([
    Actions.token.getBalance(client, { account: sender, token }),
    Actions.token.getBalance(client, { account: recipient, token }),
  ])

  const receipt = await example()

  expect(receipt.status).toBe('success')
  expect(receipt.from.toLowerCase()).toBe(sender.toLowerCase())
  expect(receipt.to?.toLowerCase()).toBe(token.toLowerCase())

  const [sender_after, recipient_after] = await Promise.all([
    Actions.token.getBalance(client, { account: sender, token }),
    Actions.token.getBalance(client, { account: recipient, token }),
  ])
  expect(recipient_after.amount - recipient_before.amount).toBe(
    1_500_000_000_000_000_000n,
  )
  expect(sender_after.amount - sender_before.amount).toBe(
    500_000_000_000_000_000n,
  )
}, 120_000)
