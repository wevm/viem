import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const owner = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const recipient = '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
const spender = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
const token = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const ether = 1_000_000_000_000_000_000n

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source.match(/\bClient\.create\s*\(/g)).toHaveLength(1)
  expect(source).not.toMatch(/impersonat/i)
}, 60_000)

test('approves and spends part of the allowance', async () => {
  const [owner_before, recipient_before] = await Promise.all([
    Actions.token.getBalance(client, { account: owner, token }),
    Actions.token.getBalance(client, { account: recipient, token }),
  ])

  const result = await example()

  expect(result.approved).toBe(25n * ether)
  expect(result.remaining).toBe(15n * ether)
  expect(
    (
      await Actions.token.getAllowance(client, {
        account: owner,
        spender,
        token,
      })
    ).amount,
  ).toBe(15n * ether)

  const [owner_after, recipient_after] = await Promise.all([
    Actions.token.getBalance(client, { account: owner, token }),
    Actions.token.getBalance(client, { account: recipient, token }),
  ])
  expect(owner_after.amount).toBe(owner_before.amount + 40n * ether)
  expect(recipient_after.amount).toBe(recipient_before.amount + 10n * ether)
}, 120_000)
