import { Client, Token, http } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { expect, test } from 'vitest'

import * as utils from './utils.js'

const alphaUsd = Token.from({
  addresses: { 1337: '0x20c0000000000000000000000000000000000001' },
  currency: 'USD',
  decimals: 6,
  name: 'AlphaUSD',
  symbol: 'alphaUSD',
})

const client = Client.create({
  chain: tempoLocalnet,
  tokens: [alphaUsd],
  transport: http('http://localhost:0'),
})

test('resolveToken: declared symbol', () => {
  expect(utils.resolveToken(client, { token: 'alphaUSD' })).toEqual({
    address: '0x20c0000000000000000000000000000000000001',
    decimals: 6,
  })
})

test('resolveToken: declared symbol is case-insensitive', () => {
  expect(utils.resolveToken(client, { token: 'ALPHAUSD' })).toEqual({
    address: '0x20c0000000000000000000000000000000000001',
    decimals: 6,
  })
})

test('resolveToken: explicit decimals override declared decimals', () => {
  expect(
    utils.resolveToken(client, { decimals: 2, token: 'alphaUSD' }),
  ).toEqual({
    address: '0x20c0000000000000000000000000000000000001',
    decimals: 2,
  })
})

test('resolveToken: unknown symbol throws', () => {
  expect(() =>
    utils.resolveToken(client, { token: 'unknown' }),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Token "unknown" is not a declared ERC-20 token on the client's \`tokens\` array (with an address for the client's chain), and is not a valid address.]`,
  )
})

test('resolveToken: token id', () => {
  expect(utils.resolveToken(client, { token: 1n })).toEqual({
    address: '0x20c0000000000000000000000000000000000001',
    decimals: 6,
  })
})

test('resolveToken: token id of an undeclared token', () => {
  expect(utils.resolveToken(client, { token: 2n })).toEqual({
    address: '0x20c0000000000000000000000000000000000002',
    decimals: undefined,
  })
})

test('resolveToken: declared address infers decimals', () => {
  expect(
    utils.resolveToken(client, {
      token: '0x20c0000000000000000000000000000000000001',
    }),
  ).toEqual({
    address: '0x20c0000000000000000000000000000000000001',
    decimals: 6,
  })
})

test('resolveToken: undeclared address', () => {
  expect(
    utils.resolveToken(client, {
      token: '0x20c0000000000000000000000000000000000009',
    }),
  ).toEqual({
    address: '0x20c0000000000000000000000000000000000009',
    decimals: undefined,
  })
})

test('resolveTokenWithDecimals: declared token skips the contract read', async () => {
  // The transport points at an unroutable endpoint — resolution must not hit it.
  expect(
    await utils.resolveTokenWithDecimals(client, { token: 'alphaUSD' }),
  ).toEqual({
    address: '0x20c0000000000000000000000000000000000001',
    decimals: 6,
  })
})

test('resolveToken: without a client', () => {
  expect(utils.resolveToken(undefined, { token: 1n })).toEqual({
    address: '0x20c0000000000000000000000000000000000001',
    decimals: undefined,
  })
  expect(
    utils.resolveToken(undefined, {
      decimals: 6,
      token: '0x20c0000000000000000000000000000000000001',
    }),
  ).toEqual({
    address: '0x20c0000000000000000000000000000000000001',
    decimals: 6,
  })
})

test('resolveToken: symbols require a client', () => {
  expect(() =>
    utils.resolveToken(undefined, { token: 'alphaUSD' }),
  ).toThrowError()
})

test('resolveCallParameters', () => {
  const args = { token: 1n }
  expect(utils.resolveCallParameters([client, args])).toEqual([client, args])
  expect(utils.resolveCallParameters([args])).toEqual([undefined, args])
})

test('pickWriteParameters', () => {
  const picked = utils.pickWriteParameters({
    account: '0xa',
    amount: 1n,
    chain: tempoLocalnet,
    feePayer: true,
    feeToken: 1n,
    gas: 21_000n,
    keyAuthorization: { type: 'secp256k1' },
    maxFeePerGas: 2n,
    maxPriorityFeePerGas: 1n,
    nonce: 1n,
    nonceKey: 'expiring',
    to: '0xb',
    token: 1n,
    validAfter: 1,
    validBefore: 2,
  })
  expect(picked).toEqual({
    account: '0xa',
    chain: tempoLocalnet,
    feePayer: true,
    feeToken: 1n,
    gas: 21_000n,
    keyAuthorization: { type: 'secp256k1' },
    maxFeePerGas: 2n,
    maxPriorityFeePerGas: 1n,
    nonce: 1n,
    nonceKey: 'expiring',
    validAfter: 1,
    validBefore: 2,
  })
  expect(picked).not.toHaveProperty('token')
  expect(picked).not.toHaveProperty('amount')
  expect(picked).not.toHaveProperty('to')
})
