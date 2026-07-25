import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sender0 = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// History-free address: anvil dev accounts carry EIP-7702 sweeper delegations
// on real mainnet, so forked transfers to them are swept in the same tx.
const recipient = '0x4242424242424242424242424242424242424242'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/Client\.create\(\{[\s\S]*?\baccount\s*:/)
  expect(source).not.toMatch(/sendSync\(\s*client\s*,\s*\{[^}]*\baccount\s*:/s)
}, 90_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 90_000)

test('sends ETH from the hoisted account', async () => {
  const before = await Actions.address.getBalance(client, {
    address: recipient,
  })
  const receipt = await example()
  expect(receipt.status).toBe('success')

  const transaction = await Actions.transaction.getReceipt(client, {
    hash: receipt.transactionHash,
  })
  expect(transaction.status).toBe('success')
  expect(transaction.from.toLowerCase()).toBe(sender0)
  expect(transaction.to?.toLowerCase()).toBe(recipient)

  const after = await Actions.address.getBalance(client, { address: recipient })
  expect(after - before).toBe(1_250_000_000_000_000_000n)
}, 180_000)
