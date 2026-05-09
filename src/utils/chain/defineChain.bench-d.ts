import { attest } from '@ark/attest'
import { test } from 'vitest'

import { defineChain, extendSchema } from './defineChain.js'

test('default', () => {
  defineChain({
    id: 1,
    name: 'Test',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://localhost:8545'] } },
  })
  attest.instantiations([682, 'instantiations'])
})

test('behavior: extend', () => {
  defineChain({
    id: 1,
    extendSchema: extendSchema<{ foo: string }>(),
    name: 'Test',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://localhost:8545'] } },
  }).extend({
    foo: 'bar',
  })
  attest.instantiations([862, 'instantiations'])
})
