import { expect, test } from 'vitest'

import { parseGwei } from '../unit/parseGwei.js'

import { maxUint256 } from '~viem/constants/number.js'
import { assertRequest } from './assertRequest.js'

test('invalid address', () => {
  expect(() =>
    assertRequest({ account: { address: '0x1', type: 'json-rpc' } }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidAddressError: Address "0x1" is invalid.

    - Address must be a hex value of 20 bytes (40 hex characters).
    - Address must match its checksum counterpart.

    Version: viem@x.y.z]
  `)
})

test('fee cap too high', () => {
  expect(() =>
    assertRequest({ maxFeePerGas: maxUint256 + 1n }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [FeeCapTooHighError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

    Version: viem@x.y.z]
  `)
})

test('invalid from address', () => {
  expect(() =>
    assertRequest({ account: '0x123' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidAddressError: Address "0x123" is invalid.

    - Address must be a hex value of 20 bytes (40 hex characters).
    - Address must match its checksum counterpart.

    Version: viem@x.y.z]
  `)
})

test('invalid to address', () => {
  expect(() =>
    assertRequest({ to: '0x123' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidAddressError: Address "0x123" is invalid.

    - Address must be a hex value of 20 bytes (40 hex characters).
    - Address must match its checksum counterpart.

    Version: viem@x.y.z]
  `)
})

test('tip higher than fee cap', () => {
  expect(() =>
    assertRequest({
      maxFeePerGas: parseGwei('10'),
      maxPriorityFeePerGas: parseGwei('11'),
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [TipAboveFeeCapError: The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

    Version: viem@x.y.z]
  `)
})

test('fee conflict', () => {
  expect(() =>
    // @ts-expect-error
    assertRequest({
      gasPrice: parseGwei('8'),
      maxFeePerGas: parseGwei('10'),
      maxPriorityFeePerGas: parseGwei('11'),
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [FeeConflictError: Cannot specify both a \`gasPrice\` and a \`maxFeePerGas\`/\`maxPriorityFeePerGas\`.
    Use \`maxFeePerGas\`/\`maxPriorityFeePerGas\` for EIP-1559 compatible networks, and \`gasPrice\` for others.

    Version: viem@x.y.z]
  `)

  expect(() =>
    // @ts-expect-error
    assertRequest({
      gasPrice: parseGwei('8'),
      maxFeePerGas: parseGwei('10'),
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [FeeConflictError: Cannot specify both a \`gasPrice\` and a \`maxFeePerGas\`/\`maxPriorityFeePerGas\`.
    Use \`maxFeePerGas\`/\`maxPriorityFeePerGas\` for EIP-1559 compatible networks, and \`gasPrice\` for others.

    Version: viem@x.y.z]
  `)

  expect(() =>
    // @ts-expect-error
    assertRequest({
      gasPrice: parseGwei('8'),
      maxPriorityFeePerGas: parseGwei('11'),
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [FeeConflictError: Cannot specify both a \`gasPrice\` and a \`maxFeePerGas\`/\`maxPriorityFeePerGas\`.
    Use \`maxFeePerGas\`/\`maxPriorityFeePerGas\` for EIP-1559 compatible networks, and \`gasPrice\` for others.

    Version: viem@x.y.z]
  `)
})
