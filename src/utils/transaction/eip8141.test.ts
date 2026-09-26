import { describe, expect, test } from 'vitest'
import { accounts } from '~test/constants.js'
import { signTransaction } from '../../accounts/utils/signTransaction.js'
import type {
  FrameSignature,
  TransactionSerializableEIP8141,
  TransactionSerializedEIP8141,
} from '../../types/transaction.js'
import { getAddress } from '../address/getAddress.js'
import { concatHex } from '../data/concat.js'
import { fromRlp } from '../encoding/fromRlp.js'
import { numberToHex } from '../encoding/toHex.js'
import { toRlp } from '../encoding/toRlp.js'
import { keccak256 } from '../hash/keccak256.js'
import { recoverTransactionAddress } from '../signature/recoverTransactionAddress.js'
import { parseGwei } from '../unit/parseGwei.js'
import { assertTransactionEIP8141 } from './assertTransaction.js'
import { getSerializedTransactionType } from './getSerializedTransactionType.js'
import { getTransactionType } from './getTransactionType.js'
import { parseTransaction } from './parseTransaction.js'
import {
  attachSignatureEIP8141,
  serializeTransaction,
} from './serializeTransaction.js'

const sender = accounts[0].address
const recipient = getAddress('0x70997970c51812dc3a010c7d01b50e0d17dc79c8')

const DEFAULT = 0
const VERIFY = 1
const SENDER = 2
const APPROVE_PAYMENT = 0x01
const APPROVE_EXECUTION = 0x02
const APPROVE_EXECUTION_AND_PAYMENT = 0x03
const ATOMIC_BATCH_FLAG = 0x04

const verifyFrame = {
  mode: VERIFY,
  flags: APPROVE_EXECUTION_AND_PAYMENT,
  target: null,
  limits: { execution: 50_000n, state: 0n },
  value: 0n,
  data: '0x',
} as const

const senderFrame = {
  mode: SENDER,
  flags: 0,
  target: recipient,
  limits: { execution: 100_000n, state: 10_000n },
  value: 0n,
  data: '0xcafebabe',
} as const

const baseEIP8141: TransactionSerializableEIP8141 = {
  chainId: 1,
  nonce: 0,
  sender,
  frames: [verifyFrame, senderFrame],
  maxPriorityFeePerGas: parseGwei('1'),
  maxFeePerGas: parseGwei('10'),
}

/** Reference implementation of the EIP-8141 payload / `compute_sig_hash`. */
function referenceSigHash(tx: TransactionSerializableEIP8141) {
  const quantity = (value: bigint | number | undefined) =>
    value ? numberToHex(value) : '0x'
  return keccak256(
    concatHex([
      '0x06',
      toRlp([
        quantity(tx.chainId),
        quantity(tx.nonce),
        tx.sender,
        tx.frames.map((frame) => [
          quantity(frame.mode),
          quantity(frame.flags),
          frame.target ?? '0x',
          [quantity(frame.limits.execution), quantity(frame.limits.state)],
          quantity(frame.value),
          frame.data,
        ]),
        (tx.signatures ?? []).map((signature) => [
          quantity(signature.scheme),
          signature.signer ?? '0x',
          signature.msg,
          signature.msg === '0x' ? '0x' : signature.signature,
        ]),
        [
          quantity(tx.maxPriorityFeePerGas),
          quantity(tx.maxFeePerGas),
          quantity(tx.maxFeePerBlobGas),
        ],
        tx.blobVersionedHashes ?? [],
      ]),
    ]),
  )
}

describe('eip8141 serialization', () => {
  test('payload layout: [chain_id, nonce, sender, frames, signatures, fees, blob_versioned_hashes]', () => {
    const serialized = serializeTransaction(baseEIP8141)
    expect(serialized.slice(0, 4)).toBe('0x06')

    const payload = fromRlp(`0x${serialized.slice(4)}`, 'hex')
    expect(payload).toEqual([
      '0x01',
      '0x',
      sender,
      [
        ['0x01', '0x03', '0x', ['0xc350', '0x'], '0x', '0x'],
        [
          '0x02',
          '0x',
          recipient.toLowerCase(),
          ['0x0186a0', '0x2710'],
          '0x',
          '0xcafebabe',
        ],
      ],
      [],
      ['0x3b9aca00', '0x02540be400', '0x'],
      [],
    ])
  })

  test('signature entries are encoded as [scheme, signer, msg, signature]', () => {
    const digest = `0x${'11'.repeat(32)}` as const
    const serialized = serializeTransaction({
      ...baseEIP8141,
      signatures: [
        { scheme: 1, signer: null, msg: '0x', signature: '0x' },
        {
          scheme: 2,
          signer: recipient,
          msg: digest,
          signature: `0x${'22'.repeat(128)}`,
        },
        { scheme: 0, signer: null, msg: '0x', signature: '0xdeadbeef' },
      ],
    })
    const payload = fromRlp(`0x${serialized.slice(4)}`, 'hex')
    expect(payload[4]).toEqual([
      ['0x01', '0x', '0x', '0x'],
      ['0x02', recipient.toLowerCase(), digest, `0x${'22'.repeat(128)}`],
      ['0x', '0x', '0x', '0xdeadbeef'],
    ])
  })

  test('roundtrip: serialize then parse', () => {
    const serialized = serializeTransaction(baseEIP8141)
    expect(parseTransaction(serialized)).toEqual({
      ...baseEIP8141,
      type: 'eip8141',
    })
  })

  test('roundtrip: signatures, blobs and all frame modes', () => {
    const tx: TransactionSerializableEIP8141 = {
      ...baseEIP8141,
      nonce: 7,
      frames: [
        {
          mode: DEFAULT,
          flags: 0,
          target: recipient,
          limits: { execution: 30_000n, state: 5_000n },
          value: 0n,
          data: '0x1234',
        },
        verifyFrame,
        { ...senderFrame, value: 1_000_000n },
      ],
      signatures: [
        {
          scheme: 1,
          signer: null,
          msg: '0x',
          signature: `0x00${'ab'.repeat(64)}`,
        },
        {
          scheme: 2,
          signer: recipient,
          msg: `0x${'11'.repeat(32)}`,
          signature: `0x${'22'.repeat(128)}`,
        },
        { scheme: 0, signer: null, msg: '0x', signature: '0xdeadbeef' },
      ],
      maxFeePerBlobGas: parseGwei('2'),
      blobVersionedHashes: [`0x01${'00'.repeat(31)}`],
    }
    expect(parseTransaction(serializeTransaction(tx))).toEqual({
      ...tx,
      type: 'eip8141',
    })
  })

  test('minimal transaction (no optional fields)', () => {
    const tx: TransactionSerializableEIP8141 = {
      chainId: 1,
      sender,
      frames: [verifyFrame],
    }
    const serialized = serializeTransaction(tx)
    expect(parseTransaction(serialized)).toEqual({
      chainId: 1,
      nonce: 0,
      sender,
      frames: [verifyFrame],
      type: 'eip8141',
    })
  })

  test('null target is serialized as empty bytes', () => {
    const serialized = serializeTransaction(baseEIP8141)
    const payload = fromRlp(`0x${serialized.slice(4)}`, 'hex') as any
    expect(payload[3][0][2]).toBe('0x')
    expect(parseTransaction(serialized).frames[0].target).toBeNull()
  })

  test('serialized type byte is 0x06', () => {
    expect(serializeTransaction(baseEIP8141).startsWith('0x06')).toBe(true)
  })
})

describe('eip8141 signing', () => {
  test('signature hash elides signature bytes of entries with empty msg', async () => {
    const serialized = await signTransaction({
      privateKey: accounts[0].privateKey,
      transaction: baseEIP8141,
    })
    const signed = parseTransaction(serialized)
    expect(signed.signatures).toHaveLength(1)
    const [signature] = signed.signatures!
    expect(signature.scheme).toBe(1)
    expect(signature.signer).toBeNull()
    expect(signature.msg).toBe('0x')
    // v (1 byte) || r (32 bytes) || s (32 bytes)
    expect(signature.signature).toHaveLength(2 + 65 * 2)
    expect(['0x00', '0x01']).toContain(signature.signature.slice(0, 4))

    expect(
      await recoverTransactionAddress({
        serializedTransaction: serialized,
      }),
    ).toBe(getAddress(sender))
  })

  test('signature hash matches the EIP-8141 reference implementation', async () => {
    const serialized = await signTransaction({
      privateKey: accounts[0].privateKey,
      transaction: baseEIP8141,
    })
    const signed = parseTransaction(serialized)
    const [signature] = signed.signatures!
    expect(
      await recoverTransactionAddress({
        serializedTransaction: serialized,
        signature: {
          yParity: Number(signature.signature.slice(2, 4)),
          r: `0x${signature.signature.slice(4, 68)}`,
          s: `0x${signature.signature.slice(68, 132)}`,
        },
      }),
    ).toBe(getAddress(sender))
    // The unsigned transaction (empty signature slot) hashes to the same value.
    expect(referenceSigHash(signed)).toBe(
      keccak256(
        serializeTransaction({
          ...signed,
          signatures: [{ ...signature, signature: '0x' }],
        }),
      ),
    )
  })

  test('fills the first unsigned SECP256K1 slot and keeps other entries', async () => {
    const other: FrameSignature = {
      scheme: 1,
      signer: recipient,
      msg: '0x',
      signature: `0x01${'ab'.repeat(64)}`,
    }
    const transaction: TransactionSerializableEIP8141 = {
      ...baseEIP8141,
      signatures: [
        other,
        { scheme: 1, signer: null, msg: '0x', signature: '0x' },
      ],
    }
    const serialized = await signTransaction({
      privateKey: accounts[0].privateKey,
      transaction,
    })
    const signed = parseTransaction(serialized)
    expect(signed.signatures).toHaveLength(2)
    expect(signed.signatures![0]).toEqual(other)
    expect(signed.signatures![1].signature).not.toBe('0x')

    // The hash committed to elides both empty-msg entries' bytes.
    expect(
      await recoverTransactionAddress({ serializedTransaction: serialized }),
    ).toBe(getAddress(sender))
    expect(referenceSigHash(signed)).toBe(
      keccak256(
        serializeTransaction({
          ...signed,
          signatures: signed.signatures!.map((signature) => ({
            ...signature,
            signature: '0x' as const,
          })),
        }),
      ),
    )
  })

  test('attachSignatureEIP8141 appends a slot when none exists', () => {
    expect(attachSignatureEIP8141(undefined)).toEqual([
      { scheme: 1, signer: null, msg: '0x', signature: '0x' },
    ])
    expect(
      attachSignatureEIP8141(undefined, {
        r: `0x${'01'.repeat(32)}`,
        s: `0x${'02'.repeat(32)}`,
        yParity: 1,
      }),
    ).toEqual([
      {
        scheme: 1,
        signer: null,
        msg: '0x',
        signature: `0x01${'01'.repeat(32)}${'02'.repeat(32)}`,
      },
    ])
  })

  test('attachSignatureEIP8141 skips slots with an explicit signer', () => {
    const sponsorSlot: FrameSignature = {
      scheme: 1,
      signer: recipient,
      msg: '0x',
      signature: '0x',
    }
    expect(attachSignatureEIP8141([sponsorSlot])).toEqual([
      sponsorSlot,
      { scheme: 1, signer: null, msg: '0x', signature: '0x' },
    ])
  })

  test('attachSignatureEIP8141 derives yParity from v', () => {
    const [signature] = attachSignatureEIP8141([], {
      r: `0x${'01'.repeat(32)}`,
      s: `0x${'02'.repeat(32)}`,
      v: 27n,
    })
    expect(signature.signature.slice(0, 4)).toBe('0x00')
  })

  test('recoverTransactionAddress rejects unsigned transactions', async () => {
    await expect(() =>
      recoverTransactionAddress({
        serializedTransaction: serializeTransaction(baseEIP8141),
      }),
    ).rejects.toThrow('EIP-8141 transactions require a `SECP256K1` signature')
  })
})

describe('eip8141 getTransactionType', () => {
  test('infers eip8141 from frames property', () => {
    expect(getTransactionType(baseEIP8141)).toBe('eip8141')
  })

  test('infers eip8141 from explicit type', () => {
    expect(getTransactionType({ ...baseEIP8141, type: 'eip8141' })).toBe(
      'eip8141',
    )
  })
})

describe('eip8141 getSerializedTransactionType', () => {
  test('identifies 0x06 prefix as eip8141', () => {
    expect(
      getSerializedTransactionType(serializeTransaction(baseEIP8141)),
    ).toBe('eip8141')
  })
})

describe('eip8141 assertTransaction', () => {
  test('valid transaction passes', () => {
    expect(() => assertTransactionEIP8141(baseEIP8141)).not.toThrow()
  })

  test('invalid chainId', () => {
    expect(() =>
      assertTransactionEIP8141({ ...baseEIP8141, chainId: 0 }),
    ).toThrow('Chain ID "0" is invalid.')
  })

  test('invalid sender address', () => {
    expect(() =>
      assertTransactionEIP8141({ ...baseEIP8141, sender: '0xinvalid' as any }),
    ).toThrow('Address "0xinvalid" is invalid.')
  })

  test('empty frames', () => {
    expect(() =>
      assertTransactionEIP8141({ ...baseEIP8141, frames: [] }),
    ).toThrow('`frames` must contain at least one frame.')
  })

  test('exceeds MAX_FRAMES (64)', () => {
    const frames = Array.from({ length: 65 }, () => senderFrame)
    expect(() => assertTransactionEIP8141({ ...baseEIP8141, frames })).toThrow(
      'MAX_FRAMES (64)',
    )
  })

  test('exactly MAX_FRAMES (64) passes', () => {
    const frames = Array.from({ length: 64 }, () => ({
      ...senderFrame,
      limits: { execution: 1_000n, state: 0n },
    }))
    expect(() =>
      assertTransactionEIP8141({ ...baseEIP8141, frames }),
    ).not.toThrow()
  })

  test('invalid frame mode (>2)', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [{ ...senderFrame, mode: 3 as any }],
      }),
    ).toThrow('Invalid frame mode 3')
  })

  test('reserved flag bits rejected', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [{ ...senderFrame, flags: 0x08 }],
      }),
    ).toThrow('Bits 3 and above are reserved')
  })

  test('VERIFY frame with zero APPROVE scope is allowed (e.g. expiry verifier)', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [{ ...verifyFrame, flags: 0 }, verifyFrame, senderFrame],
      }),
    ).not.toThrow()
  })

  test('non-SENDER frame with value rejected', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [{ ...verifyFrame, value: 1n }, senderFrame],
      }),
    ).toThrow('`frame.value` must be 0 for DEFAULT and VERIFY frames')
  })

  test('APPROVE_EXECUTION scope must target sender or null', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [{ ...verifyFrame, target: recipient }, senderFrame],
      }),
    ).toThrow('APPROVE_EXECUTION')
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [{ ...verifyFrame, target: sender }, senderFrame],
      }),
    ).not.toThrow()
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { ...verifyFrame, flags: APPROVE_PAYMENT, target: recipient },
          senderFrame,
        ],
      }),
    ).not.toThrow()
  })

  test('atomic batch flag on VERIFY frame rejected', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [{ ...verifyFrame, flags: ATOMIC_BATCH_FLAG }, senderFrame],
      }),
    ).toThrow('not valid with VERIFY mode')
  })

  test('atomic batch flag on last frame rejected', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [verifyFrame, { ...senderFrame, flags: ATOMIC_BATCH_FLAG }],
      }),
    ).toThrow('must not be the last frame')
  })

  test('atomic batch flag: next frame must not be VERIFY', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          verifyFrame,
          { ...senderFrame, flags: ATOMIC_BATCH_FLAG },
          verifyFrame,
          senderFrame,
        ],
      }),
    ).toThrow('must not be VERIFY mode')
  })

  test('atomic batch is allowed on DEFAULT and SENDER frames', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          verifyFrame,
          { ...senderFrame, mode: DEFAULT, flags: ATOMIC_BATCH_FLAG },
          { ...senderFrame, flags: ATOMIC_BATCH_FLAG },
          senderFrame,
        ],
      }),
    ).not.toThrow()
  })

  test('frames in an atomic batch must not permit an APPROVE scope', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          verifyFrame,
          { ...senderFrame, flags: ATOMIC_BATCH_FLAG | APPROVE_PAYMENT },
          senderFrame,
        ],
      }),
    ).toThrow('atomic batch must not permit an APPROVE scope')
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          verifyFrame,
          { ...senderFrame, flags: ATOMIC_BATCH_FLAG },
          { ...senderFrame, flags: APPROVE_PAYMENT },
        ],
      }),
    ).toThrow('atomic batch must not permit an APPROVE scope')
  })

  test('total frame gas (execution + state) must be < 2^64', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { ...senderFrame, limits: { execution: 2n ** 63n, state: 0n } },
          { ...senderFrame, limits: { execution: 2n ** 63n, state: 0n } },
        ],
      }),
    ).toThrow('must be less than 2^64')
  })

  test('intrinsic + execution gas must fit the EIP-7825 cap', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          verifyFrame,
          { ...senderFrame, limits: { execution: 16_777_216n, state: 0n } },
        ],
      }),
    ).toThrow('EIP-7825 transaction gas cap')
    // State gas does not count towards the execution cap.
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          verifyFrame,
          { ...senderFrame, limits: { execution: 100n, state: 16_777_216n } },
        ],
      }),
    ).not.toThrow()
    // Calldata floor: 65 kB of data costs 16 * 4 gas per byte.
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          verifyFrame,
          { ...senderFrame, data: `0x${'00'.repeat(262_144)}` },
        ],
      }),
    ).toThrow('EIP-7825 transaction gas cap')
  })

  test('expiry verifier frame constraints', () => {
    const expiryFrame = {
      mode: VERIFY,
      flags: 0,
      target: '0x0000000000000000000000000000000000008141',
      limits: { execution: 10_000n, state: 0n },
      value: 0n,
      data: '0x0000000068000000',
    } as const
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [expiryFrame, verifyFrame, senderFrame],
      }),
    ).not.toThrow()
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [{ ...expiryFrame, data: '0x00' }, verifyFrame, senderFrame],
      }),
    ).toThrow('Expiry verifier frames')
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { ...expiryFrame, limits: { execution: 10_000n, state: 1n } },
          verifyFrame,
          senderFrame,
        ],
      }),
    ).toThrow('Expiry verifier frames')
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [
          { ...expiryFrame, flags: APPROVE_PAYMENT },
          verifyFrame,
          senderFrame,
        ],
      }),
    ).toThrow('Expiry verifier frames')
  })

  test('invalid frame target address', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        frames: [verifyFrame, { ...senderFrame, target: '0xnope' as any }],
      }),
    ).toThrow('Address "0xnope" is invalid.')
  })

  test('fee cap too high', () => {
    expect(() =>
      assertTransactionEIP8141({ ...baseEIP8141, maxFeePerGas: 2n ** 256n }),
    ).toThrow('The fee cap')
  })

  test('tip above fee cap', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        maxFeePerGas: 1n,
        maxPriorityFeePerGas: 2n,
      }),
    ).toThrow('The provided tip')
  })
})

describe('eip8141 signature constraints', () => {
  const withSignature = (signature: FrameSignature) => ({
    ...baseEIP8141,
    signatures: [signature],
  })

  test('unknown scheme rejected', () => {
    expect(() =>
      assertTransactionEIP8141(
        withSignature({
          scheme: 3 as any,
          signer: null,
          msg: '0x',
          signature: '0x',
        }),
      ),
    ).toThrow('Invalid signature scheme 3')
  })

  test('ARBITRARY signer must be empty', () => {
    expect(() =>
      assertTransactionEIP8141(
        withSignature({
          scheme: 0,
          signer: recipient,
          msg: '0x',
          signature: '0x1234',
        }),
      ),
    ).toThrow('`signer` must be empty for ARBITRARY signatures.')
    expect(() =>
      assertTransactionEIP8141(
        withSignature({ scheme: 0, signer: null, msg: '0x', signature: '0x' }),
      ),
    ).not.toThrow()
  })

  test('msg must be empty or a non-zero 32-byte digest', () => {
    expect(() =>
      assertTransactionEIP8141(
        withSignature({
          scheme: 1,
          signer: null,
          msg: '0x01',
          signature: '0x',
        }),
      ),
    ).toThrow('`msg` must be empty or a 32-byte digest.')
    expect(() =>
      assertTransactionEIP8141(
        withSignature({
          scheme: 1,
          signer: null,
          msg: `0x${'00'.repeat(32)}`,
          signature: '0x',
        }),
      ),
    ).toThrow('`msg` must not be the zero digest.')
  })

  test('SECP256K1 signature must be 65 bytes with v in {0, 1}', () => {
    expect(() =>
      assertTransactionEIP8141(
        withSignature({
          scheme: 1,
          signer: null,
          msg: '0x',
          signature: `0x${'ab'.repeat(64)}`,
        }),
      ),
    ).toThrow('must be 65 bytes')
    expect(() =>
      assertTransactionEIP8141(
        withSignature({
          scheme: 1,
          signer: null,
          msg: '0x',
          signature: `0x1b${'ab'.repeat(64)}`,
        }),
      ),
    ).toThrow('`v` must be 0 or 1')
  })

  test('P256 signature must be 128 bytes', () => {
    expect(() =>
      assertTransactionEIP8141(
        withSignature({
          scheme: 2,
          signer: recipient,
          msg: '0x',
          signature: `0x${'ab'.repeat(64)}`,
        }),
      ),
    ).toThrow('must be 128 bytes')
  })

  test('invalid signer address rejected', () => {
    expect(() =>
      assertTransactionEIP8141(
        withSignature({
          scheme: 1,
          signer: '0xnope' as any,
          msg: '0x',
          signature: '0x',
        }),
      ),
    ).toThrow('Address "0xnope" is invalid.')
  })
})

describe('eip8141 blob-field invariants', () => {
  test('maxFeePerBlobGas non-zero without blobs rejected', () => {
    expect(() =>
      assertTransactionEIP8141({ ...baseEIP8141, maxFeePerBlobGas: 1n }),
    ).toThrow('`maxFeePerBlobGas` must be 0 when no blob versioned hashes')
  })

  test('blob versioned hashes must be 32 bytes with version 0x01', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        maxFeePerBlobGas: 1n,
        blobVersionedHashes: ['0x0100'],
      }),
    ).toThrow('Versioned hash "0x0100" size is invalid.')
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        maxFeePerBlobGas: 1n,
        blobVersionedHashes: [`0x02${'00'.repeat(31)}`],
      }),
    ).toThrow('version is invalid')
  })

  test('blobs present with valid maxFeePerBlobGas passes', () => {
    expect(() =>
      assertTransactionEIP8141({
        ...baseEIP8141,
        maxFeePerBlobGas: 1n,
        blobVersionedHashes: [`0x01${'00'.repeat(31)}`],
      }),
    ).not.toThrow()
  })
})

describe('eip8141 parser strictness', () => {
  const payload = (tx: TransactionSerializableEIP8141) =>
    fromRlp(`0x${serializeTransaction(tx).slice(4)}`, 'hex') as any[]
  const encode = (items: any) =>
    concatHex(['0x06', toRlp(items)]) as TransactionSerializedEIP8141

  test('rejects wrong number of top-level RLP items', () => {
    const items = payload(baseEIP8141)
    expect(() => parseTransaction(encode(items.slice(0, 6)))).toThrow(
      'Invalid serialized transaction of type "eip8141" was provided.',
    )
  })

  test('rejects fees list with wrong length', () => {
    const items = payload(baseEIP8141)
    items[5] = items[5].slice(0, 2)
    expect(() => parseTransaction(encode(items))).toThrow(
      'Invalid serialized transaction of type "eip8141" was provided.',
    )
  })

  test('rejects frame tuple with fewer than 6 elements', () => {
    const items = payload(baseEIP8141)
    items[3][0] = items[3][0].slice(0, 5)
    expect(() => parseTransaction(encode(items))).toThrow(
      'Invalid serialized transaction of type "eip8141" was provided.',
    )
  })

  test('rejects frame limits with wrong length', () => {
    const items = payload(baseEIP8141)
    items[3][0][3] = ['0x01']
    expect(() => parseTransaction(encode(items))).toThrow(
      'Invalid serialized transaction of type "eip8141" was provided.',
    )
  })

  test('rejects signature tuple with wrong length', () => {
    const items = payload(baseEIP8141)
    items[4] = [['0x01', '0x', '0x']]
    expect(() => parseTransaction(encode(items))).toThrow(
      'Invalid serialized transaction of type "eip8141" was provided.',
    )
  })

  test('rejects nonce above Number.MAX_SAFE_INTEGER', () => {
    const items = payload(baseEIP8141)
    items[1] = numberToHex(2n ** 60n)
    expect(() => parseTransaction(encode(items))).toThrow(
      'Invalid serialized transaction of type "eip8141" was provided.',
    )
  })

  test('rejects frame mode > 2', () => {
    const items = payload(baseEIP8141)
    items[3][0][0] = '0x03'
    expect(() => parseTransaction(encode(items))).toThrow(
      'Invalid serialized transaction of type "eip8141" was provided.',
    )
  })
})

describe('eip8141 spec examples', () => {
  test('Example 1a: simple ETH transfer', () => {
    const tx: TransactionSerializableEIP8141 = {
      ...baseEIP8141,
      frames: [
        verifyFrame,
        {
          mode: SENDER,
          flags: 0,
          target: recipient,
          limits: { execution: 21_000n, state: 0n },
          value: 1_000_000_000_000_000n,
          data: '0x',
        },
      ],
    }
    expect(parseTransaction(serializeTransaction(tx))).toEqual({
      ...tx,
      type: 'eip8141',
    })
  })

  test('Example 1b: account deployment (DEFAULT + VERIFY + SENDER)', () => {
    const tx: TransactionSerializableEIP8141 = {
      ...baseEIP8141,
      frames: [
        {
          mode: DEFAULT,
          flags: 0,
          target: getAddress('0x0000000000000000000000000000000000007997'),
          limits: { execution: 200_000n, state: 100_000n },
          value: 0n,
          data: '0xdeadbeef',
        },
        verifyFrame,
        senderFrame,
      ],
    }
    expect(() => assertTransactionEIP8141(tx)).not.toThrow()
    expect(parseTransaction(serializeTransaction(tx))).toEqual({
      ...tx,
      type: 'eip8141',
    })
  })

  test('Example 2: atomic approve + swap', () => {
    const tx: TransactionSerializableEIP8141 = {
      ...baseEIP8141,
      frames: [
        verifyFrame,
        { ...senderFrame, flags: ATOMIC_BATCH_FLAG },
        senderFrame,
      ],
    }
    expect(() => assertTransactionEIP8141(tx)).not.toThrow()
    expect(parseTransaction(serializeTransaction(tx))).toEqual({
      ...tx,
      type: 'eip8141',
    })
  })

  test('Example 3: sponsored transaction', () => {
    const sponsor = getAddress('0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc')
    const tx: TransactionSerializableEIP8141 = {
      ...baseEIP8141,
      frames: [
        { ...verifyFrame, flags: APPROVE_EXECUTION },
        {
          ...verifyFrame,
          flags: APPROVE_PAYMENT,
          target: sponsor,
          data: '0x1234',
        },
        senderFrame,
        senderFrame,
        { ...senderFrame, mode: DEFAULT, target: sponsor },
      ],
      signatures: [
        { scheme: 1, signer: null, msg: '0x', signature: '0x' },
        {
          scheme: 1,
          signer: sponsor,
          msg: '0x',
          signature: `0x00${'ab'.repeat(64)}`,
        },
      ],
    }
    expect(() => assertTransactionEIP8141(tx)).not.toThrow()
    expect(parseTransaction(serializeTransaction(tx))).toEqual({
      ...tx,
      type: 'eip8141',
    })
  })
})
