import { expectTypeOf, test } from 'vitest'

import * as Chain from './Chain.js'

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

  expectTypeOf(chain.id).toEqualTypeOf<1>()
  expectTypeOf(chain.testnet).toEqualTypeOf<true>()
  // chainable
  expectTypeOf(chain.extend).toBeFunction()
})
