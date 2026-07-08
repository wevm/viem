import { Abi } from 'ox'
import type { Hex } from 'ox'
import { Actions, Client, http } from 'viem'
import { expectTypeOf, test } from 'vitest'

const client = Client.create({ transport: http() })

const erc20Abi = Abi.from([
  'function name() view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
])

const to = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'

test('auto mode: block is optional, result extras are optional', async () => {
  const result = await Actions.multicall(client, {
    calls: [{ abi: erc20Abi, functionName: 'name', to }],
  })

  expectTypeOf(result.block).toEqualTypeOf<
    | Awaited<ReturnType<typeof Actions.block.get<undefined, false, 'latest'>>>
    | undefined
  >()

  const call = result.results[0]
  if (call.status === 'success') {
    expectTypeOf(call.result).toEqualTypeOf<string>()
    expectTypeOf(call.gasUsed).toEqualTypeOf<bigint | undefined>()
    expectTypeOf(call.data).toEqualTypeOf<Hex.Hex | undefined>()
  }
})

test('forcing option narrows to the rich shape', async () => {
  const result = await Actions.multicall(client, {
    account: to,
    calls: [{ abi: erc20Abi, functionName: 'name', to }],
    traceAssetChanges: true,
  })

  expectTypeOf(result.assetChanges).toEqualTypeOf<
    readonly Actions.multicall.AssetChange[]
  >()
  expectTypeOf(result.block).not.toEqualTypeOf<undefined>()

  const call = result.results[0]
  if (call.status === 'success') {
    expectTypeOf(call.gasUsed).toEqualTypeOf<bigint>()
    expectTypeOf(call.data).toEqualTypeOf<Hex.Hex>()
  }
})

test('simulate pin: rich shape', async () => {
  const result = await Actions.multicall(client, {
    mode: 'simulate',
    calls: [{ abi: erc20Abi, functionName: 'name', to }],
  })

  expectTypeOf(result.assetChanges).toEqualTypeOf<
    readonly Actions.multicall.AssetChange[]
  >()

  const call = result.results[0]
  if (call.status === 'success')
    expectTypeOf(call.gasUsed).toEqualTypeOf<bigint>()
})

test('multicall pin: lean shape without block or extras', async () => {
  const result = await Actions.multicall(client, {
    mode: 'multicall',
    calls: [
      { abi: erc20Abi, functionName: 'name', to },
      {
        abi: erc20Abi,
        args: ['0x70997970c51812dc3a010c7d01b50e0d17dc79c8'],
        functionName: 'balanceOf',
        to,
      },
    ],
  })

  expectTypeOf<keyof typeof result>().toEqualTypeOf<'results'>()

  const [name, balance] = result.results
  if (name.status === 'success') {
    expectTypeOf(name.result).toEqualTypeOf<string>()
    expectTypeOf(name).not.toHaveProperty('gasUsed')
  }
  if (balance.status === 'success')
    expectTypeOf(balance.result).toEqualTypeOf<bigint>()
})

test('multicall pin: simulate-only options are rejected', async () => {
  await Actions.multicall(client, {
    mode: 'multicall',
    calls: [{ abi: erc20Abi, functionName: 'name', to }],
    // @ts-expect-error traceAssetChanges unavailable with the multicall mode
    traceAssetChanges: true,
  }).catch(() => {})
})

test('simulate pin: multicall-only options are rejected', async () => {
  await Actions.multicall(client, {
    mode: 'simulate',
    calls: [{ abi: erc20Abi, functionName: 'name', to }],
    // @ts-expect-error batchSize unavailable with the simulate mode
    batchSize: 1024,
  }).catch(() => {})
})

test('allowFailure: false returns bare results', async () => {
  const result = await Actions.multicall(client, {
    allowFailure: false,
    calls: [
      { abi: erc20Abi, functionName: 'name', to },
      {
        abi: erc20Abi,
        args: ['0x70997970c51812dc3a010c7d01b50e0d17dc79c8'],
        functionName: 'balanceOf',
        to,
      },
    ],
  })

  const [name, balance] = result.results
  expectTypeOf(name).toEqualTypeOf<string>()
  expectTypeOf(balance).toEqualTypeOf<bigint>()
})
