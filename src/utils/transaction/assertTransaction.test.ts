import { expect, test } from 'vitest'
import { parseGwei } from '../unit/index.js'
import {
  assertTransactionEIP1559,
  assertTransactionEIP2930,
  assertTransactionLegacy,
} from './assertTransaction.js'

test('fee cap too high', () => {
  expect(() =>
    assertTransactionEIP1559({
      maxFeePerGas: 2n ** 256n - 1n + 1n,
      chainId: 1,
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

    Version: viem@1.0.2"
  `)

  expect(() =>
    assertTransactionEIP2930({
      gasPrice: 2n ** 256n - 1n + 1n,
      chainId: 1,
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

    Version: viem@1.0.2"
  `)

  expect(() =>
    assertTransactionLegacy({
      gasPrice: 2n ** 256n - 1n + 1n,
      chainId: 1,
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

    Version: viem@1.0.2"
  `)
})

test('tip higher than fee cap', () => {
  expect(() =>
    assertTransactionEIP1559({
      maxFeePerGas: parseGwei('10'),
      maxPriorityFeePerGas: parseGwei('11'),
      chainId: 1,
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

    Version: viem@1.0.2"
  `)
})

test('invalid chainId', () => {
  expect(() =>
    assertTransactionEIP1559({ chainId: 0 }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Chain ID \\"0\\" is invalid.

    Version: viem@1.0.2"
  `)

  expect(() =>
    assertTransactionEIP2930({ chainId: 0 }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Chain ID \\"0\\" is invalid.

    Version: viem@1.0.2"
  `)

  expect(() =>
    assertTransactionLegacy({ chainId: 0 }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Chain ID \\"0\\" is invalid.

    Version: viem@1.0.2"
  `)
})

test('invalid address', () => {
  expect(() =>
    assertTransactionEIP1559({ to: '0x123', chainId: 1 }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Address \\"0x123\\" is invalid.

    Version: viem@1.0.2"
  `)

  expect(() =>
    assertTransactionEIP2930({ to: '0x123', chainId: 1 }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Address \\"0x123\\" is invalid.

    Version: viem@1.0.2"
  `)

  expect(() =>
    assertTransactionLegacy({ to: '0x123', chainId: 1 }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Address \\"0x123\\" is invalid.

    Version: viem@1.0.2"
  `)
})

test('invalid transaction type', () => {
  expect(() =>
    assertTransactionEIP1559({
      gasPrice: parseGwei('1') as unknown as undefined,
      chainId: 1,
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "\`gasPrice\` is not a valid EIP-1559 Transaction attribute.

    Version: viem@1.0.2"
  `)

  expect(() =>
    assertTransactionEIP2930({
      chainId: 1,
      maxPriorityFeePerGas: parseGwei('1') as unknown as undefined,
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "\`maxFeePerGas\`/\`maxPriorityFeePerGas\` is not a valid EIP-2930 Transaction attribute.

    Version: viem@1.0.2"
  `)

  expect(() =>
    assertTransactionLegacy({
      maxFeePerGas: parseGwei('1') as unknown as undefined,
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "\`maxFeePerGas\`/\`maxPriorityFeePerGas\` is not a valid Legacy Transaction attribute.

    Version: viem@1.0.2"
  `)

  expect(() =>
    assertTransactionLegacy({
      accessList: [] as unknown as undefined,
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "\`accessList\` is not a valid Legacy Transaction attribute.

    Version: viem@1.0.2"
  `)
})
