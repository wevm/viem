import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abi, type Address } from 'viem/utils'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

// Runtime bytecode: SLOAD slot 0, return it as a 32-byte word (ignores calldata).
const bytecode = '0x60005460005260206000f3'
const abi = Abi.from(['function getValue() view returns (uint256)'])

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

type Stub = {
  address: Address.Address
  value: bigint
}

function word(value: bigint) {
  return `0x${value.toString(16).padStart(64, '0')}`
}

test('sets code and storage before reading the contracts', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/Actions\.address\.setCode/)
  expect(source).toMatch(/Actions\.address\.setStorageAt/)
  expect(source).toMatch(/Actions\.contract\.read/)
}, 60_000)

test('takes no inputs', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('stubs both contracts and returns the injected values', async () => {
  const first: Stub = {
    address: '0x51ab7042d3cbeff0e5c25671e419b1682d29d757',
    value: 481_516_234_233n,
  }
  const second: Stub = {
    address: '0xc0ffee254729296a45a3885639ac7e10f9d54979',
    value: 42n,
  }

  expect(await example()).toEqual({
    first: first.value,
    second: second.value,
  })

  for (const { address, value } of [first, second]) {
    expect(await Actions.address.getCode(client, { address })).toBe(bytecode)
    expect(
      await Actions.address.getStorageAt(client, { address, slot: '0x0' }),
    ).toBe(word(value))
    expect(
      await Actions.contract.read(client, {
        abi,
        address,
        functionName: 'getValue',
      }),
    ).toBe(value)
  }
}, 120_000)
