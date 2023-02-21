import { expect, test } from 'vitest'
import { parseGwei } from '../unit'

import { assertRequest } from './assertRequest'

test('fee cap too high', () => {
  expect(() =>
    assertRequest({ maxFeePerGas: 2n ** 256n - 1n + 1n }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

    Version: viem@1.0.2"
  `)
})

test('tip higher than fee cap', () => {
  expect(() =>
    assertRequest({
      maxFeePerGas: parseGwei('10'),
      maxPriorityFeePerGas: parseGwei('11'),
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

    Version: viem@1.0.2"
  `)
})
