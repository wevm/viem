import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { batchRead } from '../src/index.ts'

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const holder = '0x28C6c06298d514Db089934071355E5743bf21d60'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const erc20Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'totalSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
] as const

async function rpc(method: string, params: unknown[]) {
  const res = await fetch('http://anvil:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new Error(error.message)
  return result
}

async function ethCall(to: string, data: string): Promise<string> {
  return rpc('eth_call', [{ to, data }, 'latest'])
}

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('batches three USDC reads into unwrapped values in order', async () => {
  const values = await batchRead(client, {
    reads: [
      { to: usdc, abi: erc20Abi, functionName: 'balanceOf', args: [holder] },
      { to: usdc, abi: erc20Abi, functionName: 'totalSupply' },
      { to: usdc, abi: erc20Abi, functionName: 'decimals' },
    ],
  })
  expectTypeOf(values).toEqualTypeOf<readonly [bigint, bigint, number]>()
  expect(values).toHaveLength(3)

  const balance = BigInt(
    await ethCall(
      usdc,
      `0x70a08231${holder.slice(2).toLowerCase().padStart(64, '0')}`,
    ),
  )
  const supply = BigInt(await ethCall(usdc, '0x18160ddd'))
  const decimals = Number(BigInt(await ethCall(usdc, '0x313ce567')))

  expect(values[0]).toBe(balance)
  expect(values[1]).toBe(supply)
  expect(values[2]).toBe(decimals)
  expect(balance).toBe(31872448355n)
  expect(decimals).toBe(6)
}, 60_000)

test.skip('derives arguments for every call', () => {
  batchRead(client, {
    reads: [
      {
        to: usdc,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [
          // @ts-expect-error Arguments are derived from each function.
          1n,
        ],
      },
    ],
  })
})

test('rejects the whole batch when a read fails', async () => {
  const abi = [
    {
      type: 'function',
      name: 'doesNotExist',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ type: 'uint256' }],
    },
  ] as const
  await expect(
    batchRead(client, {
      reads: [
        { to: usdc, abi: erc20Abi, functionName: 'decimals' },
        { to: usdc, abi, functionName: 'doesNotExist' },
      ],
    }),
  ).rejects.toThrow()
}, 60_000)
