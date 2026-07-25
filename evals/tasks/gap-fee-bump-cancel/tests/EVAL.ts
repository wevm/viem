import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

// Anvil dev accounts (EIP-7702 code cleared at boot; safe recipients).
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const originalRecipient = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
const replacementRecipient = '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
const value = 1_234_567_890_123_456n

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('prepares and replaces one pending transaction', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/Actions\.transaction\.prepare/)
  expect(source.match(/Actions\.transaction\.send\s*\(/g)).toHaveLength(2)
  expect(source).toMatch(/maxFeePerGas/)
  expect(source).toMatch(/maxPriorityFeePerGas/)
  expect(source).toMatch(/Actions\.block\.setAutomine/)
  expect(source).toMatch(/Actions\.block\.mine/)
  expect(source).toMatch(/Actions\.txpool\.dropTransaction/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('replacement lands, original is dropped', async () => {
  const nonce = await Actions.address.getTransactionCount(client, {
    address: sender,
    blockTag: 'pending',
  })
  const [originalBalance, replacementBalance] = await Promise.all([
    Actions.address.getBalance(client, { address: originalRecipient }),
    Actions.address.getBalance(client, { address: replacementRecipient }),
  ])

  const result = await example()

  expect(result.originalHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
  expect(result.replacementHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
  expect(result.replacementHash).not.toBe(result.originalHash)
  expect(result.landedHash).toBe(result.replacementHash)

  const replacementReceipt = await Actions.transaction.getReceipt(client, {
    hash: result.replacementHash,
  })
  expect(replacementReceipt.status).toBe('success')
  expect(replacementReceipt.from.toLowerCase()).toBe(sender.toLowerCase())
  expect(replacementReceipt.to?.toLowerCase()).toBe(
    replacementRecipient.toLowerCase(),
  )

  const replacement = await Actions.transaction.get(client, {
    hash: result.replacementHash,
  })
  expect(Number(replacement.nonce)).toBe(nonce)

  const block = await Actions.block.get(client, { includeTransactions: true })
  const hashes = block.transactions.map((transaction) => transaction.hash)
  expect(hashes).toContain(result.replacementHash)
  expect(hashes).not.toContain(result.originalHash)

  const [originalBalance_after, replacementBalance_after] = await Promise.all([
    Actions.address.getBalance(client, { address: originalRecipient }),
    Actions.address.getBalance(client, { address: replacementRecipient }),
  ])
  expect(replacementBalance_after - replacementBalance).toBe(value)
  expect(originalBalance_after - originalBalance).toBe(0n)
}, 120_000)
