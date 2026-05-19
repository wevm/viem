import type * as Address from 'ox/Address'
import { describe, expectTypeOf, test } from 'vp/test'

import { Chain } from '../index.js'
import * as ChainSubpath from 'viem/Chain'

describe('define', () => {
  test('types: is exposed from the root and subpath entrypoints', () => {
    expectTypeOf(Chain.define).toEqualTypeOf<typeof ChainSubpath.define>()
    expectTypeOf<Chain.NativeCurrency>().toEqualTypeOf<ChainSubpath.NativeCurrency>()
  })

  test('types: accepts bigint ids', () => {
    const chain = Chain.define({
      id: 1n,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      preconfirmationTime: 250,
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
    })

    expectTypeOf(chain).toExtend<Chain.Chain>()
    expectTypeOf(chain.id).toEqualTypeOf<bigint>()
    expectTypeOf(chain.name).toEqualTypeOf<'Test'>()
    expectTypeOf(chain.preconfirmationTime).toEqualTypeOf<250>()
  })

  test('types: accepts bigint source ids', () => {
    const chain = Chain.define({
      id: 10n,
      sourceId: 1n,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
    })

    expectTypeOf(chain).toExtend<Chain.Chain>()
    expectTypeOf(chain.id).toEqualTypeOf<bigint>()
    expectTypeOf(chain.sourceId).toEqualTypeOf<bigint>()
  })

  test('types: rejects non-bigint ids', () => {
    Chain.define({
      // @ts-expect-error - chain IDs must be bigint.
      id: 1,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
    })

    Chain.define({
      id: 1n,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
      // @ts-expect-error - source chain IDs must be bigint.
      sourceId: '0x1',
    })
  })

  test('types: preserves inferred chain extension metadata', () => {
    const chain = Chain.define({
      id: 1n,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
    })

    const extended = chain.extend({
      feeToken: '0x0000000000000000000000000000000000000000',
    })

    expectTypeOf(extended).toExtend<Chain.Chain>()
    expectTypeOf(
      extended.feeToken,
    ).toEqualTypeOf<'0x0000000000000000000000000000000000000000'>()
    expectTypeOf(extended.id).toEqualTypeOf<bigint>()
  })

  test('types: validates definition-time chain extension metadata', () => {
    const chain = Chain.define({
      extendSchema: Chain.extendSchema<{ feeToken: Address.Address }>(),
      id: 1n,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
    })

    const extended = chain.extend({
      feeToken: '0x0000000000000000000000000000000000000000',
    })

    expectTypeOf(
      extended.feeToken,
    ).toEqualTypeOf<'0x0000000000000000000000000000000000000000'>()

    // @ts-expect-error - missing required property
    chain.extend({})

    // @ts-expect-error - wrong type
    chain.extend({ feeToken: 123 })

    const extendedAgain = extended.extend((chain) => ({
      displayName: `${chain.name} (${chain.feeToken})`,
    }))

    expectTypeOf(extendedAgain.displayName).toEqualTypeOf<string>()
  })

  test('types: validates generic chain extension metadata', () => {
    const chain = Chain.define({
      id: 1n,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
    })

    const extended = chain.extend<{ feeToken: Address.Address }>({
      feeToken: '0x0000000000000000000000000000000000000000',
    })

    expectTypeOf(extended.feeToken).toEqualTypeOf<Address.Address>()
  })

  test('types: callback chain extensions', () => {
    const chain = Chain.define({
      id: 1n,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
    })

    const extended = chain.extend((chain) => ({
      label: chain.name,
    }))

    expectTypeOf(extended.label).toEqualTypeOf<'Test'>()
  })

  test('types: directional formatter overrides', () => {
    const chain = Chain.define({
      id: 1n,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
      formatters: {
        block: {
          type: 'block',
          fromRpc: (value: unknown) => ({ value }),
        },
        transactionRequest: {
          type: 'transactionRequest',
          toRpc: (value: unknown) => ({ value }),
        },
      },
    })

    expectTypeOf(chain.formatters?.block?.fromRpc).toEqualTypeOf<
      ((value: unknown) => { value: unknown }) | undefined
    >()
    expectTypeOf(chain.formatters?.transactionRequest?.toRpc).toEqualTypeOf<
      ((value: unknown) => { value: unknown }) | undefined
    >()

    Chain.define({
      id: 1n,
      name: 'Test',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://localhost:8545'] } },
      formatters: {
        block: {
          type: 'block',
          // @ts-expect-error - `format` was replaced by `fromRpc` and `toRpc`.
          format: (value: unknown) => value,
        },
      },
    })
  })

  test('types: exposes extendSchema', () => {
    expectTypeOf(Chain.extendSchema<{ foo: string }>()).toEqualTypeOf<{
      foo: string
    }>()
  })
})
