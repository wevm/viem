import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const expected = '0x3264cf6880ebaa762f2d977e91f7775d36701939'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/Actions\.contract\.deploy(?:Sync)?\(/)
  expect(source).toMatch(/Addresses\.create2/)
  expect(source).toMatch(/ContractAddress\.fromCreate2/)
}, 60_000)

test('takes no inputs', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('predicts the CREATE2 address and deploys code there', async () => {
  const { predicted, deployed } = await example()
  expect(predicted.toLowerCase()).toBe(expected)
  expect(deployed.toLowerCase()).toBe(expected)
  const code = await Actions.address.getCode(client, { address: expected })
  expect(code).toBeDefined()
  if (!code) throw new Error('expected deployed code')
  expect(code.length).toBeGreaterThan(2)
  expect(code).toBe('0x00')
}, 120_000)
