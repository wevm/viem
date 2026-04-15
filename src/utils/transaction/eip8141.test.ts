import { describe, expect, test } from 'vitest'
import { maxUint256 } from '../../constants/number.js'
import type {
  TransactionSerializableEIP8141,
  TransactionSerializedEIP8141,
} from '../../types/transaction.js'
import { parseGwei } from '../unit/parseGwei.js'
import { assertTransactionEIP8141 } from './assertTransaction.js'
import { getSerializedTransactionType } from './getSerializedTransactionType.js'
import { getTransactionType } from './getTransactionType.js'
import { parseTransaction } from './parseTransaction.js'
import { serializeTransaction } from './serializeTransaction.js'

const sender = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' as const

const baseEIP8141: TransactionSerializableEIP8141 = {
  chainId: 1,
  nonce: 0,
  sender,
  frames: [
    {
      mode: 1,
      flags: 0x03,
      target: null,
      gasLimit: 50000n,
      data: '0xdeadbeef',
    },
    {
      mode: 2,
      flags: 0x00,
      target: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      gasLimit: 100000n,
      data: '0xcafebabe',
    },
  ],
  maxPriorityFeePerGas: parseGwei('1'),
  maxFeePerGas: parseGwei('10'),
  maxFeePerBlobGas: 0n,
  blobVersionedHashes: [],
}

describe('eip8141 serialization', () => {
  test('roundtrip: serialize then parse', () => {
    const serialized = serializeTransaction(baseEIP8141)
    expect(serialized.startsWith('0x06')).toBe(true)
    const parsed = parseTransaction(serialized)
    const { maxFeePerBlobGas: _, blobVersionedHashes: __, ...expected } = baseEIP8141
    expect(parsed).toEqual({
      ...expected,
      type: 'eip8141',
    })
  })

  test('minimal transaction (no optional fields)', () => {
    const tx: TransactionSerializableEIP8141 = {
      chainId: 1,
      sender,
      frames: [
        {
          mode: 1,
          flags: 0x03,
          target: null,
          gasLimit: 21000n,
          data: '0x00',
        },
      ],
    }
    const serialized = serializeTransaction(tx)
    expect(serialized.startsWith('0x06')).toBe(true)
    const parsed = parseTransaction(serialized)
    expect(parsed.chainId).toBe(1)
    expect(parsed.sender).toBe(sender)
    expect(parsed.frames).toHaveLength(1)
    expect(parsed.frames[0].mode).toBe(1)
    expect(parsed.frames[0].flags).toBe(0x03)
    expect(parsed.frames[0].target).toBeNull()
    expect(parsed.frames[0].gasLimit).toBe(21000n)
  })

  test('preserves flags field through roundtrip', () => {
    const tx: TransactionSerializableEIP8141 = {
      chainId: 1,
      sender,
      frames: [
        {
          mode: 1,
          flags: 0x01,
          target: null,
          gasLimit: 50000n,
          data: '0xab',
        },
        {
          mode: 1,
          flags: 0x02,
          target: null,
          gasLimit: 50000n,
          data: '0xcd',
        },
        {
          mode: 1,
          flags: 0x03,
          target: null,
          gasLimit: 50000n,
          data: '0xef',
        },
      ],
    }
    const serialized = serializeTransaction(tx)
    const parsed = parseTransaction(serialized)
    expect(parsed.frames[0].flags).toBe(0x01)
    expect(parsed.frames[1].flags).toBe(0x02)
    expect(parsed.frames[2].flags).toBe(0x03)
  })

  test('atomic batch flag roundtrip', () => {
    const tx: TransactionSerializableEIP8141 = {
      chainId: 1,
      sender,
      frames: [
        { mode: 1, flags: 0x03, target: null, gasLimit: 50000n, data: '0xaa' },
        {
          mode: 2,
          flags: 0x04,
          target: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          gasLimit: 100000n,
          data: '0xbb',
        },
        {
          mode: 2,
          flags: 0x00,
          target: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          gasLimit: 100000n,
          data: '0xcc',
        },
      ],
    }
    const serialized = serializeTransaction(tx)
    const parsed = parseTransaction(serialized)
    expect(parsed.frames[1].flags).toBe(0x04)
    expect(parsed.frames[2].flags).toBe(0x00)
  })

  test('all three modes', () => {
    const tx: TransactionSerializableEIP8141 = {
      chainId: 1,
      sender,
      frames: [
        { mode: 0, flags: 0x00, target: sender, gasLimit: 10000n, data: '0x' },
        {
          mode: 1,
          flags: 0x03,
          target: null,
          gasLimit: 50000n,
          data: '0xdeadbeef',
        },
        {
          mode: 2,
          flags: 0x00,
          target: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          gasLimit: 100000n,
          data: '0xcafebabe',
        },
      ],
    }
    const serialized = serializeTransaction(tx)
    const parsed = parseTransaction(serialized)
    expect(parsed.frames[0].mode).toBe(0)
    expect(parsed.frames[1].mode).toBe(1)
    expect(parsed.frames[2].mode).toBe(2)
  })

  test('fee fields preserved', () => {
    const serialized = serializeTransaction(baseEIP8141)
    const parsed = parseTransaction(serialized)
    expect(parsed.maxPriorityFeePerGas).toBe(parseGwei('1'))
    expect(parsed.maxFeePerGas).toBe(parseGwei('10'))
  })

  test('blob fields preserved when present', () => {
    const tx: TransactionSerializableEIP8141 = {
      ...baseEIP8141,
      maxFeePerBlobGas: 1000n,
      blobVersionedHashes: [
        '0x01febabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe',
      ],
    }
    const serialized = serializeTransaction(tx)
    const parsed = parseTransaction(serialized)
    expect(parsed.maxFeePerBlobGas).toBe(1000n)
    expect(parsed.blobVersionedHashes).toEqual([
      '0x01febabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe',
    ])
  })

  test('nonce field preserved', () => {
    const tx: TransactionSerializableEIP8141 = {
      ...baseEIP8141,
      nonce: 42,
    }
    const serialized = serializeTransaction(tx)
    const parsed = parseTransaction(serialized)
    expect(parsed.nonce).toBe(42)
  })
})

describe('eip8141 getTransactionType', () => {
  test('infers eip8141 from frames property', () => {
    expect(
      getTransactionType({
        frames: baseEIP8141.frames,
        sender,
        chainId: 1,
      } as any),
    ).toBe('eip8141')
  })

  test('infers eip8141 from explicit type', () => {
    expect(getTransactionType({ type: 'eip8141' } as any)).toBe('eip8141')
  })
})

describe('eip8141 getSerializedTransactionType', () => {
  test('identifies 0x06 prefix as eip8141', () => {
    expect(getSerializedTransactionType('0x06abc')).toBe('eip8141')
  })
})

describe('eip8141 assertTransaction', () => {
  test('valid transaction passes', () => {
    expect(() => assertTransactionEIP8141(baseEIP8141)).not.toThrow()
  })

  test('invalid chainId', () => {
    expect(() =>
      assertTransactionEIP8141({ ...baseEIP8141, chainId: 0 }),
    ).toThrow('Chain ID')
  })

  test('invalid sender address', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        sender: '0xinvalid' as any,
      }),
    ).toThrow('invalid')
  })

  test('zero-address sender rejected', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        sender: '0x0000000000000000000000000000000000000000',
      }),
    ).toThrow('zero address')
  })

  test('empty frames', () => {
    expect(() =>
      assertTransactionEIP8141({ ...baseEIP8141, frames: [] }),
    ).toThrow('at least one frame')
  })

  test('exceeds MAX_FRAMES (64)', () => {
    const frames = Array.from({ length: 65 }, () => ({
      mode: 0 as const,
      flags: 0,
      target: sender,
      gasLimit: 1n,
      data: '0x' as const,
    }))
    expect(() =>
      assertTransactionEIP8141({ ...baseEIP8141, frames }),
    ).toThrow('MAX_FRAMES (64)')
  })

  test('exactly MAX_FRAMES (64) passes', () => {
    const frames = Array.from({ length: 64 }, () => ({
      mode: 0 as const,
      flags: 0,
      target: sender,
      gasLimit: 1n,
      data: '0x' as const,
    }))
    expect(() =>
      assertTransactionEIP8141({ ...baseEIP8141, frames }),
    ).not.toThrow()
  })

  test('invalid frame mode (>2)', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [{ mode: 3 as any, flags: 0, target: null, gasLimit: 1n, data: '0x' }],
      }),
    ).toThrow('Invalid frame mode')
  })

  test('invalid frame flags (>=8, reserved bits set)', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { mode: 2, flags: 8, target: null, gasLimit: 1n, data: '0x' },
        ],
      }),
    ).toThrow('Bits 3-7 are reserved')
  })

  test('flags=0xff rejected', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { mode: 2, flags: 0xff, target: null, gasLimit: 1n, data: '0x' },
        ],
      }),
    ).toThrow('Bits 3-7 are reserved')
  })

  test('VERIFY frame with zero APPROVE scope rejected', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { mode: 1, flags: 0x00, target: null, gasLimit: 1n, data: '0x' },
        ],
      }),
    ).toThrow('non-zero APPROVE scope')
  })

  test('VERIFY frame with APPROVE_PAYMENT (0x01) passes', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { mode: 1, flags: 0x01, target: null, gasLimit: 1n, data: '0x' },
        ],
      }),
    ).not.toThrow()
  })

  test('VERIFY frame with APPROVE_EXECUTION (0x02) passes', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { mode: 1, flags: 0x02, target: null, gasLimit: 1n, data: '0x' },
        ],
      }),
    ).not.toThrow()
  })

  test('VERIFY frame with APPROVE_PAYMENT_AND_EXECUTION (0x03) passes', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { mode: 1, flags: 0x03, target: null, gasLimit: 1n, data: '0x' },
        ],
      }),
    ).not.toThrow()
  })

  test('atomic batch flag on non-SENDER mode rejected', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { mode: 0, flags: 0x04, target: sender, gasLimit: 1n, data: '0x' },
          { mode: 2, flags: 0x00, target: null, gasLimit: 1n, data: '0x' },
        ],
      }),
    ).toThrow('only valid with SENDER mode')
  })

  test('atomic batch flag on last frame rejected', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { mode: 1, flags: 0x03, target: null, gasLimit: 1n, data: '0x' },
          { mode: 2, flags: 0x04, target: null, gasLimit: 1n, data: '0x' },
        ],
      }),
    ).toThrow('must not be the last frame')
  })

  test('atomic batch flag: next frame must be SENDER', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { mode: 1, flags: 0x03, target: null, gasLimit: 1n, data: '0x' },
          { mode: 2, flags: 0x04, target: null, gasLimit: 1n, data: '0x' },
          { mode: 0, flags: 0x00, target: sender, gasLimit: 1n, data: '0x' },
        ],
      }),
    ).toThrow('following an atomic batch frame must be SENDER')
  })

  test('valid atomic batch: SENDER frames with flag set then unset', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { mode: 1, flags: 0x03, target: null, gasLimit: 1n, data: '0x' },
          { mode: 2, flags: 0x04, target: null, gasLimit: 1n, data: '0x' },
          { mode: 2, flags: 0x00, target: null, gasLimit: 1n, data: '0x' },
        ],
      }),
    ).not.toThrow()
  })

  test('frame gas_limit > 2^63-1 rejected', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          {
            mode: 1,
            flags: 0x03,
            target: null,
            gasLimit: 2n ** 63n,
            data: '0x',
          },
        ],
      }),
    ).toThrow('gasLimit` must be <= 2^63 - 1')
  })

  test('frame gas_limit at 2^63-1 passes', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          {
            mode: 1,
            flags: 0x03,
            target: null,
            gasLimit: 2n ** 63n - 1n,
            data: '0x',
          },
        ],
      }),
    ).not.toThrow()
  })

  test('total frame gas > 2^63-1 rejected', () => {
    const gasPerFrame = 2n ** 63n - 1n
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { mode: 1, flags: 0x03, target: null, gasLimit: gasPerFrame, data: '0x' },
          { mode: 2, flags: 0x00, target: null, gasLimit: 1n, data: '0x' },
        ],
      }),
    ).toThrow('Total frame gas must be <= 2^63 - 1')
  })

  test('invalid frame target address', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { mode: 1, flags: 0x03, target: '0xbad' as any, gasLimit: 1n, data: '0x' },
        ],
      }),
    ).toThrow('invalid')
  })

  test('fee cap too high', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        maxFeePerGas: maxUint256 + 1n,
      }),
    ).toThrow()
  })

  test('tip above fee cap', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        maxFeePerGas: parseGwei('1'),
        maxPriorityFeePerGas: parseGwei('2'),
      }),
    ).toThrow()
  })
})

describe('eip8141 spec examples', () => {
  test('Example 1: Simple Transaction (self-verify + sender)', () => {
    const tx: TransactionSerializableEIP8141 = {
      chainId: 1,
      nonce: 0,
      sender,
      frames: [
        {
          mode: 1,
          flags: 0x03,
          target: null,
          gasLimit: 50000n,
          data: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefde',
        },
        {
          mode: 2,
          flags: 0x00,
          target: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          gasLimit: 100000n,
          data: '0xcafebabe',
        },
      ],
      maxPriorityFeePerGas: parseGwei('1'),
      maxFeePerGas: parseGwei('10'),
    }
    const serialized = serializeTransaction(tx)
    const parsed = parseTransaction(serialized)
    expect(parsed.frames[0].mode).toBe(1)
    expect(parsed.frames[0].flags).toBe(0x03)
    expect(parsed.frames[1].mode).toBe(2)
    expect(parsed.frames[1].flags).toBe(0x00)
  })

  test('Example 2: Atomic Approve + Swap (verify + 2 SENDER atomic batch)', () => {
    const erc20 = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as const
    const dex = '0x1111111254fb6c44bac0bed2854e76f90643097d' as const
    const tx: TransactionSerializableEIP8141 = {
      chainId: 1,
      nonce: 5,
      sender,
      frames: [
        {
          mode: 1,
          flags: 0x03,
          target: null,
          gasLimit: 50000n,
          data: '0xabcdef',
        },
        {
          mode: 2,
          flags: 0x04,
          target: erc20,
          gasLimit: 60000n,
          data: '0x095ea7b3',
        },
        {
          mode: 2,
          flags: 0x00,
          target: dex,
          gasLimit: 200000n,
          data: '0x12345678',
        },
      ],
      maxPriorityFeePerGas: parseGwei('2'),
      maxFeePerGas: parseGwei('20'),
    }
    const serialized = serializeTransaction(tx)
    const parsed = parseTransaction(serialized)
    expect(parsed.frames[1].flags & 0x04).toBe(0x04)
    expect(parsed.frames[2].flags & 0x04).toBe(0x00)
  })

  test('Example 3: Sponsored Transaction (only_verify + pay + sender)', () => {
    const sponsor = '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc' as const
    const tx: TransactionSerializableEIP8141 = {
      chainId: 1,
      nonce: 10,
      sender,
      frames: [
        {
          mode: 1,
          flags: 0x02,
          target: null,
          gasLimit: 30000n,
          data: '0xdeadbeef',
        },
        {
          mode: 1,
          flags: 0x01,
          target: sponsor,
          gasLimit: 40000n,
          data: '0xfeedface',
        },
        {
          mode: 2,
          flags: 0x00,
          target: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          gasLimit: 100000n,
          data: '0xcafebabe',
        },
      ],
      maxPriorityFeePerGas: parseGwei('1'),
      maxFeePerGas: parseGwei('10'),
    }
    const serialized = serializeTransaction(tx)
    const parsed = parseTransaction(serialized)
    expect(parsed.frames[0].flags & 0x03).toBe(0x02)
    expect(parsed.frames[1].flags & 0x03).toBe(0x01)
  })

  test('Example 1b: Account deployment (DEFAULT + VERIFY + SENDER)', () => {
    const deployer = '0x4e59b44847b379578588920ca78fbf26c0b4956c' as const
    const tx: TransactionSerializableEIP8141 = {
      chainId: 1,
      nonce: 0,
      sender,
      frames: [
        {
          mode: 0,
          flags: 0x00,
          target: deployer,
          gasLimit: 200000n,
          data: '0x600060005260206000f3',
        },
        {
          mode: 1,
          flags: 0x03,
          target: null,
          gasLimit: 50000n,
          data: '0xaabbccdd',
        },
        {
          mode: 2,
          flags: 0x00,
          target: null,
          gasLimit: 100000n,
          data: '0x11223344',
        },
      ],
      maxPriorityFeePerGas: parseGwei('1'),
      maxFeePerGas: parseGwei('10'),
    }
    const serialized = serializeTransaction(tx)
    const parsed = parseTransaction(serialized)
    expect(parsed.frames[0].mode).toBe(0)
    expect(parsed.frames[1].mode).toBe(1)
    expect(parsed.frames[2].mode).toBe(2)
  })

  test('multiple consecutive atomic batches', () => {
    const target1 = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as const
    const target2 = '0x1111111254fb6c44bac0bed2854e76f90643097d' as const
    const tx: TransactionSerializableEIP8141 = {
      chainId: 1,
      nonce: 0,
      sender,
      frames: [
        { mode: 1, flags: 0x03, target: null, gasLimit: 50000n, data: '0xaa' },
        {
          mode: 2,
          flags: 0x04,
          target: target1,
          gasLimit: 60000n,
          data: '0xbb',
        },
        {
          mode: 2,
          flags: 0x00,
          target: target1,
          gasLimit: 60000n,
          data: '0xcc',
        },
        {
          mode: 2,
          flags: 0x04,
          target: target2,
          gasLimit: 80000n,
          data: '0xdd',
        },
        {
          mode: 2,
          flags: 0x04,
          target: target2,
          gasLimit: 80000n,
          data: '0xee',
        },
        {
          mode: 2,
          flags: 0x00,
          target: target2,
          gasLimit: 80000n,
          data: '0xff',
        },
      ],
      maxPriorityFeePerGas: parseGwei('1'),
      maxFeePerGas: parseGwei('10'),
    }
    expect(() => assertTransactionEIP8141(tx)).not.toThrow()
    const serialized = serializeTransaction(tx)
    const parsed = parseTransaction(serialized)
    expect(parsed.frames).toHaveLength(6)
  })
})

describe('eip8141 edge cases', () => {
  test('null target resolves correctly (serialized as empty 0x)', () => {
    const tx: TransactionSerializableEIP8141 = {
      chainId: 1,
      sender,
      frames: [
        { mode: 1, flags: 0x03, target: null, gasLimit: 21000n, data: '0x' },
      ],
    }
    const serialized = serializeTransaction(tx)
    const parsed = parseTransaction(serialized)
    expect(parsed.frames[0].target).toBeNull()
  })

  test('explicit target address preserved', () => {
    const target = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' as const
    const tx: TransactionSerializableEIP8141 = {
      chainId: 1,
      sender,
      frames: [
        { mode: 1, flags: 0x03, target, gasLimit: 21000n, data: '0x' },
      ],
    }
    const serialized = serializeTransaction(tx)
    const parsed = parseTransaction(serialized)
    expect(parsed.frames[0].target).toBe(target)
  })

  test('empty data preserved as 0x', () => {
    const tx: TransactionSerializableEIP8141 = {
      chainId: 1,
      sender,
      frames: [
        { mode: 1, flags: 0x03, target: null, gasLimit: 21000n, data: '0x' },
      ],
    }
    const serialized = serializeTransaction(tx)
    const parsed = parseTransaction(serialized)
    expect(parsed.frames[0].data).toBe('0x')
  })

  test('zero gasLimit preserved', () => {
    const tx: TransactionSerializableEIP8141 = {
      chainId: 1,
      sender,
      frames: [
        { mode: 1, flags: 0x03, target: null, gasLimit: 0n, data: '0xaa' },
      ],
    }
    const serialized = serializeTransaction(tx)
    const parsed = parseTransaction(serialized)
    expect(parsed.frames[0].gasLimit).toBe(0n)
  })

  test('serialized type byte is 0x06', () => {
    const serialized = serializeTransaction(baseEIP8141)
    expect(serialized.slice(0, 4)).toBe('0x06')
  })

  test('parse rejects wrong number of top-level RLP items', () => {
    expect(() =>
      parseTransaction('0x06c50102030405' as TransactionSerializedEIP8141),
    ).toThrow()
  })
})
