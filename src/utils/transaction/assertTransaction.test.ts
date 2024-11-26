import { describe, expect, test } from 'vitest'

import { parseGwei } from '../unit/parseGwei.js'

import { maxUint256 } from '~viem/constants/number.js'
import {
  assertTransactionEIP1559,
  assertTransactionEIP2930,
  assertTransactionEIP4844,
  assertTransactionEIP7702,
  assertTransactionLegacy,
} from './assertTransaction.js'

describe('eip7702', () => {
  test('invalid chainId', () => {
    expect(() =>
      assertTransactionEIP7702({
        authorizationList: [
          {
            contractAddress: '0x0000000000000000000000000000000000000000',
            chainId: -1,
            nonce: 0,
            r: '0x',
            s: '0x',
            yParity: 0,
          },
        ],
        chainId: 1,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidChainIdError: Chain ID "-1" is invalid.

      Version: viem@x.y.z]
    `)
  })

  test('invalid address', () => {
    expect(() =>
      assertTransactionEIP7702({
        authorizationList: [
          {
            contractAddress: '0x000000000000000000000000000000000000000z',
            chainId: 1,
            nonce: 0,
            r: '0x',
            s: '0x',
            yParity: 0,
          },
        ],
        chainId: 1,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidAddressError: Address "0x000000000000000000000000000000000000000z" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
    `)
  })

  test('fee cap too high', () => {
    expect(() =>
      assertTransactionEIP7702({
        authorizationList: [
          {
            contractAddress: '0x0000000000000000000000000000000000000000',
            chainId: 1,
            nonce: 0,
            r: '0x',
            s: '0x',
            yParity: 0,
          },
        ],
        maxFeePerGas: maxUint256 + 1n,
        chainId: 1,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [FeeCapTooHighError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Version: viem@x.y.z]
    `)
  })
})

describe('eip4844', () => {
  test('empty blobs', () => {
    expect(() =>
      assertTransactionEIP4844({
        blobVersionedHashes: [],
        chainId: 1,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [EmptyBlobError: Blob data must not be empty.

      Version: viem@x.y.z]
    `)
  })

  test('invalid blob length', () => {
    expect(() =>
      assertTransactionEIP4844({
        blobVersionedHashes: ['0xcafebabe'],
        chainId: 1,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidVersionedHashSizeError: Versioned hash "0xcafebabe" size is invalid.

      Expected: 32
      Received: 4

      Version: viem@x.y.z]
    `)
  })

  test('invalid blob version', () => {
    expect(() =>
      assertTransactionEIP4844({
        blobVersionedHashes: [
          '0xcafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe',
        ],
        chainId: 1,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidVersionedHashVersionError: Versioned hash "0xcafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe" version is invalid.

      Expected: 1
      Received: 202

      Version: viem@x.y.z]
    `)
  })

  test('fee cap too high', () => {
    expect(() =>
      assertTransactionEIP4844({
        blobVersionedHashes: [
          '0x01febabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe',
        ],
        maxFeePerGas: maxUint256 + 1n,
        chainId: 1,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [FeeCapTooHighError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Version: viem@x.y.z]
    `)
  })
})

describe('eip1559', () => {
  test('fee cap too high', () => {
    expect(() =>
      assertTransactionEIP1559({
        maxFeePerGas: maxUint256 + 1n,
        chainId: 1,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [FeeCapTooHighError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Version: viem@x.y.z]
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
      [TipAboveFeeCapError: The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

      Version: viem@x.y.z]
    `)
  })

  test('invalid chainId', () => {
    expect(() =>
      assertTransactionEIP1559({ chainId: 0 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidChainIdError: Chain ID "0" is invalid.

      Version: viem@x.y.z]
    `)
  })

  test('invalid address', () => {
    expect(() =>
      assertTransactionEIP1559({ to: '0x123', chainId: 1 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidAddressError: Address "0x123" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
    `)
  })
})

describe('eip2930', () => {
  test('fee cap too high', () => {
    expect(() =>
      assertTransactionEIP2930({
        gasPrice: maxUint256 + 1n,
        chainId: 1,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [FeeCapTooHighError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Version: viem@x.y.z]
    `)
  })

  test('invalid chainId', () => {
    expect(() =>
      assertTransactionEIP2930({ chainId: 0 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidChainIdError: Chain ID "0" is invalid.

      Version: viem@x.y.z]
    `)
  })

  test('invalid address', () => {
    expect(() =>
      assertTransactionEIP2930({ to: '0x123', chainId: 1 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidAddressError: Address "0x123" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
    `)
  })

  test('invalid transaction type', () => {
    expect(() =>
      assertTransactionEIP2930({
        chainId: 1,
        maxPriorityFeePerGas: parseGwei('1') as unknown as undefined,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [BaseError: \`maxFeePerGas\`/\`maxPriorityFeePerGas\` is not a valid EIP-2930 Transaction attribute.

      Version: viem@x.y.z]
    `)
  })
})

describe('legacy', () => {
  test('fee cap too high', () => {
    expect(() =>
      assertTransactionLegacy({
        gasPrice: maxUint256 + 1n,
        chainId: 1,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [FeeCapTooHighError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Version: viem@x.y.z]
    `)
  })

  test('invalid chainId', () => {
    expect(() =>
      assertTransactionLegacy({ chainId: 0 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidChainIdError: Chain ID "0" is invalid.

      Version: viem@x.y.z]
    `)
  })

  test('invalid address', () => {
    expect(() =>
      assertTransactionLegacy({ to: '0x123', chainId: 1 }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidAddressError: Address "0x123" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
    `)
  })
})

test('invalid transaction type', () => {
  expect(() =>
    assertTransactionEIP2930({
      chainId: 1,
      maxPriorityFeePerGas: parseGwei('1') as unknown as undefined,
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [BaseError: \`maxFeePerGas\`/\`maxPriorityFeePerGas\` is not a valid EIP-2930 Transaction attribute.

    Version: viem@x.y.z]
  `)

  expect(() =>
    assertTransactionLegacy({
      maxFeePerGas: parseGwei('1') as unknown as undefined,
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [BaseError: \`maxFeePerGas\`/\`maxPriorityFeePerGas\` is not a valid Legacy Transaction attribute.

    Version: viem@x.y.z]
  `)
})
