import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/Siwe\.createMessage\(/)
  expect(source).toMatch(/Actions\.verifySiweMessage\(/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('builds, signs, and verifies an EIP-4361 message', async () => {
  const result = await example()
  const { message } = result
  expect(message).toContain(
    'example.com wants you to sign in with your Ethereum account:',
  )
  expect(message).toContain(address)
  expect(message).toContain('URI: https://example.com/login')
  expect(message).toContain('Version: 1')
  expect(message).toContain('Chain ID: 1')
  expect(message).toContain('Nonce: foobarbaz12')
  expect(result.signature).toMatch(/^0x[0-9a-fA-F]+$/)
  expect(result.verified).toBe(true)
  expect(result.alteredNonce).toBe(false)
  expect(result.wrongSignature).toBe(false)
}, 60_000)
