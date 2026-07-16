import type { Hex } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Chain } from 'viem'
import { tempo, tempoModerato } from 'viem/chains'

import type { Hardfork } from '../tempo/Hardfork.js'

test('from: preserves literal types', () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
  })
  expectTypeOf(chain.id).toEqualTypeOf<1>()
  expectTypeOf(chain.name).toEqualTypeOf<'Ethereum'>()
})

test('extend: merges and preserves literals', () => {
  const chain = Chain.from({
    id: 1,
    name: 'Test',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://localhost:8545'] } },
  }).extend({ testnet: true })
  const chained = chain.extend({ sourceId: 10 })

  expectTypeOf(chain.id).toEqualTypeOf<1>()
  expectTypeOf(chain.testnet).toEqualTypeOf<true>()
  expectTypeOf(chained.id).toEqualTypeOf<1>()
  expectTypeOf(chained.testnet).toEqualTypeOf<true>()
  expectTypeOf(chained.sourceId).toEqualTypeOf<10>()
  expectTypeOf(chained.extend).toBeFunction()
})

test('extendSchema: declares and types extension fields', () => {
  const chain = Chain.from({
    extendSchema: Chain.extendSchema<{
      gasToken?: `0x${string}` | undefined
    }>(),
    gasToken: '0x0000000000000000000000000000000000000001',
    id: 1,
    name: 'Custom',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://localhost:8545'] } },
  })

  expectTypeOf(
    chain.gasToken,
  ).toEqualTypeOf<'0x0000000000000000000000000000000000000001'>()
  expectTypeOf<Chain.ExtractExtension<typeof chain>>().toEqualTypeOf<{
    gasToken?: `0x${string}` | undefined
  }>()
})

test('transaction hooks: custom envelope assigns without casts', () => {
  type ZedEnvelope = {
    type: 'zed'
    to?: `0x${string}` | undefined
    value?: bigint | undefined
  }

  const chain = Chain.from({
    id: 1,
    name: 'Zed',
    nativeCurrency: { name: 'Zed', symbol: 'ZED', decimals: 18 },
    rpcUrls: { default: { http: ['https://localhost:8545'] } },
    transaction: {
      getSignPayload: (envelope: ZedEnvelope): Hex.Hex => `0x${envelope.type}`,
      serialize: (envelope: ZedEnvelope): Hex.Hex => `0x7a${envelope.type}`,
      toEnvelope: (request): ZedEnvelope => ({
        type: 'zed',
        to: request.to ?? undefined,
        value: request.value,
      }),
    },
  })

  expectTypeOf(chain.transaction.getSignPayload).toEqualTypeOf<
    (envelope: ZedEnvelope) => Hex.Hex
  >()
  expectTypeOf(chain.transaction.serialize).toEqualTypeOf<
    (envelope: ZedEnvelope) => Hex.Hex
  >()
})

test('tempo: extension record and root fields', () => {
  expectTypeOf(tempoModerato.hardfork).toEqualTypeOf<'t5'>()
  expectTypeOf<
    Chain.ExtractExtension<typeof tempo>['hardfork']
  >().toEqualTypeOf<Hardfork | undefined>()
})
