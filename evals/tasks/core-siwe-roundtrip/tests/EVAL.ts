import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import {
  buildSignInMessage,
  signSignInMessage,
  verifySignIn,
} from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

// Anvil dev accounts (EIP-7702 code cleared at boot).
const privateKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const otherKey =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

const fields = {
  address,
  domain: 'example.com',
  nonce: 'foobarbaz12',
  uri: 'https://example.com/login',
} as const

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('builds an EIP-4361 message from the fields', () => {
  const message = buildSignInMessage(fields)
  expect(message).toContain(
    'example.com wants you to sign in with your Ethereum account:',
  )
  expect(message).toContain(address)
  expect(message).toContain('URI: https://example.com/login')
  expect(message).toContain('Version: 1')
  expect(message).toContain('Chain ID: 1')
  expect(message).toContain('Nonce: foobarbaz12')
})

test('verifies the signed message', async () => {
  const message = buildSignInMessage(fields)
  const signature = await signSignInMessage({ message, privateKey })
  await expect(
    verifySignIn(client, { message, nonce: 'foobarbaz12', signature }),
  ).resolves.toBe(true)
}, 60_000)

test('rejects an altered nonce', async () => {
  const message = buildSignInMessage(fields)
  const signature = await signSignInMessage({ message, privateKey })
  await expect(
    verifySignIn(client, { message, nonce: 'deadbeef00', signature }),
  ).resolves.toBe(false)
}, 60_000)

test('rejects a signature from a different key', async () => {
  const message = buildSignInMessage(fields)
  const signature = await signSignInMessage({
    message,
    privateKey: otherKey,
  })
  await expect(
    verifySignIn(client, { message, nonce: 'foobarbaz12', signature }),
  ).resolves.toBe(false)
}, 60_000)
