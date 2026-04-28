import { expect, test } from 'vitest'

import { createNonceManager } from './nonceManager.js'

const args = {
  address: '0x0000000000000000000000000000000000000001',
  chainId: 1,
  client: {} as never,
} as const

test('reset clears consumed nonce cache', async () => {
  const nonceManager = createNonceManager({
    source: {
      get: () => 1,
      set: () => {},
    },
  })

  expect(await nonceManager.consume(args)).toBe(1)

  nonceManager.reset(args)

  expect(await nonceManager.consume(args)).toBe(1)
})

test('get preserves consumed nonce cache', async () => {
  const nonceManager = createNonceManager({
    source: {
      get: () => 1,
      set: () => {},
    },
  })

  expect(await nonceManager.consume(args)).toBe(1)
  expect(await nonceManager.get(args)).toBe(2)
  expect(await nonceManager.consume(args)).toBe(2)
})
