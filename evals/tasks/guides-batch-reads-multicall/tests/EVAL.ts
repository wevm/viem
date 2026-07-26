import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abis } from 'viem/utils'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const source = readFileSync('src/index.ts', 'utf8')
const vault = '0x83F20F44975D03b1b09e64809B757c47f942BEeA'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('exports a zero-input Viem example', () => {
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/\bActions\.multicall\s*\(/)
  expect(source).toMatch(/Abis\.erc4626/)
  expect(source).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('batches and decodes the sDAI vault snapshot', async () => {
  const [asset, totalAssets, assetsPerShare] = await Promise.all([
    Actions.contract.read(client, {
      abi: Abis.erc4626,
      address: vault,
      functionName: 'asset',
    }),
    Actions.contract.read(client, {
      abi: Abis.erc4626,
      address: vault,
      functionName: 'totalAssets',
    }),
    Actions.contract.read(client, {
      abi: Abis.erc4626,
      address: vault,
      args: [1_000_000_000_000_000_000n],
      functionName: 'convertToAssets',
    }),
  ])

  expect(await example()).toEqual({ asset, assetsPerShare, totalAssets })
}, 60_000)
