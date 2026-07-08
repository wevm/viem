import { Abi } from 'ox'
import type { Hex } from 'ox'
import { Actions, Client, http, publicActions } from 'viem'
import { expectTypeOf, test } from 'vitest'

const client = Client.create({ transport: http() })

const wagmiAbi = Abi.from([
  'function mint(uint256 tokenId)',
  'function name() view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
])

test('per-call results discriminate on status and infer abi return types', async () => {
  const result = await Actions.block.simulate(client, {
    blocks: [
      {
        calls: [
          {
            to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
            value: 1n,
          },
          {
            abi: wagmiAbi,
            functionName: 'name',
            to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
          },
          {
            abi: wagmiAbi,
            args: ['0x70997970c51812dc3a010c7d01b50e0d17dc79c8'],
            functionName: 'balanceOf',
            to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
          },
        ],
      },
    ],
  })

  const calls = result[0]!.calls

  const raw = calls[0]
  if (raw.status === 'success') {
    expectTypeOf(raw.result).toEqualTypeOf<unknown>()
    expectTypeOf(raw.data).toEqualTypeOf<Hex.Hex>()
    expectTypeOf(raw.gasUsed).toEqualTypeOf<bigint>()
    expectTypeOf(raw.error).toEqualTypeOf<undefined>()
  } else {
    expectTypeOf(raw.error).toEqualTypeOf<Error>()
    expectTypeOf(raw.result).toEqualTypeOf<undefined>()
  }

  const name = calls[1]
  if (name.status === 'success')
    expectTypeOf(name.result).toEqualTypeOf<string>()

  const balance = calls[2]
  if (balance.status === 'success')
    expectTypeOf(balance.result).toEqualTypeOf<bigint>()
})

test('block fields are typed', async () => {
  const result = await Actions.block.simulate(client, {
    blocks: [
      {
        calls: [
          {
            to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
            value: 1n,
          },
        ],
      },
    ],
  })

  expectTypeOf(result[0]!.number).toEqualTypeOf<bigint>()
  expectTypeOf(result[0]!.baseFeePerGas).toEqualTypeOf<bigint | undefined>()
})

test('decorator mirrors the standalone signature', async () => {
  const decorated = client.extend(publicActions())

  const result = await decorated.block.simulate({
    blocks: [
      {
        calls: [
          {
            abi: wagmiAbi,
            functionName: 'name',
            to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
          },
        ],
      },
    ],
  })

  const call = result[0]!.calls[0]
  if (call.status === 'success')
    expectTypeOf(call.result).toEqualTypeOf<string>()
})
