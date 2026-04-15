import { describe, expect, test } from 'vitest'
import { maxUint256 } from '../../constants/number.js'
import { parseGwei } from '../unit/parseGwei.js'
import {
  assertTransactionEIP1559,
  assertTransactionEIP2930,
  assertTransactionEIP4844,
  assertTransactionEIP7702,
  assertTransactionEIP8141,
  assertTransactionLegacy,
} from './assertTransaction.js'

const sender = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' as const

describe('eip8141', () => {
  const validTx = {
    chainId: 1,
    sender,
    frames: [
      { mode: 1 as const, flags: 0x03, target: null, gasLimit: 50000n, data: '0xab' as const },
    ],
  }

  test('valid transaction passes', () => {
    expect(() => assertTransactionEIP8141(validTx)).not.toThrow()
  })

  test('zero-address sender rejected', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...validTx,
        sender: '0x0000000000000000000000000000000000000000',
      }),
    ).toThrow('zero address')
  })

  test('MAX_FRAMES is 64', () => {
    const frames = Array.from({ length: 65 }, () => ({
      mode: 0 as const,
      flags: 0,
      target: sender,
      gasLimit: 1n,
      data: '0x' as const,
    }))
    expect(() =>
      assertTransactionEIP8141({ ...validTx, frames }),
    ).toThrow('MAX_FRAMES (64)')
  })

  test('VERIFY with zero scope rejected', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...validTx,
        frames: [
          { mode: 1, flags: 0x00, target: null, gasLimit: 1n, data: '0x' as const },
        ],
      }),
    ).toThrow('non-zero APPROVE scope')
  })

  test('reserved flag bits rejected', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...validTx,
        frames: [
          { mode: 2, flags: 0x08, target: null, gasLimit: 1n, data: '0x' as const },
        ],
      }),
    ).toThrow('reserved')
  })

  test('atomic batch on DEFAULT rejected', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...validTx,
        frames: [
          { mode: 0, flags: 0x04, target: sender, gasLimit: 1n, data: '0x' as const },
          { mode: 2, flags: 0x00, target: null, gasLimit: 1n, data: '0x' as const },
        ],
      }),
    ).toThrow('only valid with SENDER')
  })

  test('gas limit per frame bounded to 2^63-1', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...validTx,
        frames: [
          { mode: 1, flags: 0x03, target: null, gasLimit: 2n ** 63n, data: '0x' as const },
        ],
      }),
    ).toThrow('gasLimit')
  })

  test('fee cap too high', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...validTx,
        maxFeePerGas: maxUint256 + 1n,
      }),
    ).toThrow()
  })

  test('tip above fee cap', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...validTx,
        maxFeePerGas: parseGwei('1'),
        maxPriorityFeePerGas: parseGwei('2'),
      }),
    ).toThrow()
  })
})

describe('eip7702', () => {
  test('invalid chainId', () => {
    expect(() =>
      assertTransactionEIP7702({
        authorizationList: [
          {
            address: '0x0000000000000000000000000000000000000000',
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
            address: '0x000000000000000000000000000000000000000z',
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
            address: '0x0000000000000000000000000000000000000000',
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
        to: '0x0000000000000000000000000000000000000000',
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
        to: '0x0000000000000000000000000000000000000000',
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
        to: '0x0000000000000000000000000000000000000000',
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
        to: '0x0000000000000000000000000000000000000000',
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
