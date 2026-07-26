import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'
const empty = '0xa1484a31504c80e30ce0a25c8f94dbaee9cde6bc'
const recipient = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses call identity without sending transactions', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/Actions\.call/)
  expect(source).toMatch(/Abis\.erc20/)
  expect(source).toMatch(/AbiFunction\.encodeData/)
  expect(source).toMatch(/account\s*:/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('reports the three dry-run outcomes', async () => {
  const [
    blockNumber,
    emptyNonce,
    emptyBalance,
    recipientBalance,
    whaleBalance,
  ] = await Promise.all([
    Actions.block.getNumber(client),
    Actions.address.getTransactionCount(client, { address: empty }),
    Actions.token.getBalance(client, { account: empty, token }),
    Actions.token.getBalance(client, { account: recipient, token }),
    Actions.token.getBalance(client, { account: whale, token }),
  ])
  const whaleNonce = await Actions.address.getTransactionCount(client, {
    address: whale,
  })

  expect(await example()).toEqual({
    empty: false,
    overBalance: false,
    small: true,
  })

  const [
    blockNumber_after,
    emptyNonce_after,
    emptyBalance_after,
    recipientBalance_after,
    whaleBalance_after,
    whaleNonce_after,
  ] = await Promise.all([
    Actions.block.getNumber(client),
    Actions.address.getTransactionCount(client, { address: empty }),
    Actions.token.getBalance(client, { account: empty, token }),
    Actions.token.getBalance(client, { account: recipient, token }),
    Actions.token.getBalance(client, { account: whale, token }),
    Actions.address.getTransactionCount(client, { address: whale }),
  ])
  expect(blockNumber_after).toBe(blockNumber)
  expect(emptyNonce_after).toBe(emptyNonce)
  expect(emptyBalance_after.amount).toBe(emptyBalance.amount)
  expect(recipientBalance_after.amount).toBe(recipientBalance.amount)
  expect(whaleBalance_after.amount).toBe(whaleBalance.amount)
  expect(whaleNonce_after).toBe(whaleNonce)
}, 60_000)
