import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const otherAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
// Ground-truth RFC 6979 EIP-191 signature of `message` by `privateKey`,
// computed independently of the code under test.
const knownSignature =
  '0x6f57e6ca624c53a1dd9573a11b6c5f0beb5d37f2790bb2d9ace1fbbb94ccdb2a29b74121c4568d7c38d4d2d0b8a54616da5c242b4b94e1e3d8edd9c6d8dd0aef1b'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

// Warm fork account state so on-chain verification is not cold under load.
beforeAll(async () => {
  await Promise.all(
    ([address, otherAddress] as const).flatMap((account) => [
      Actions.address.getBalance(client, { address: account }),
      Actions.address.getCode(client, { address: account }),
    ]),
  )
}, 120_000)

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/Actions\.verifyMessage\(/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('signs and verifies the fixed message', async () => {
  const result = await example()
  expect(result.signature).toBe(knownSignature)
  expect(result.verified).toBe(true)
  expect(result.changedMessage).toBe(false)
  expect(result.wrongAddress).toBe(false)
}, 120_000)
