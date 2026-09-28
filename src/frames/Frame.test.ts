import {
  concatHex,
  numberToHex,
  parseTransaction,
  serializeTransaction,
} from 'viem'
import { calls, Frame, verify } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import { accounts } from '~test/constants.js'
import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import type { TransactionSerializableEIP8141 } from '../types/transaction.js'
import { resolve } from './internal/transaction.js'

const account = privateKeyToAccount(accounts[0].privateKey)

function transaction() {
  return resolve({
    chainId: 8141,
    frames: [verify({ account, executionGas: 50_000n, stateGas: 0n })],
    maxFeePerGas: 20n,
    maxPriorityFeePerGas: 1n,
    nonce: 0,
    sender: account.address,
  })
}

describe('sign', () => {
  test('requires preparation', async () => {
    const request = transaction()
    await expect(
      Frame.sign(request.frames[0]!, {
        transaction: { ...request, nonce: undefined },
      }),
    ).rejects.toThrow('Prepare the transaction')
  })

  test('rejects a frame from another transaction', async () => {
    await expect(
      Frame.sign(transaction().frames[0]!, { transaction: transaction() }),
    ).rejects.toThrow('from the prepared transaction')
  })

  test('preserves the prepared transaction and can reuse a signed frame', async () => {
    const prepared = transaction()
    const before = { ...prepared }
    const signed = await Frame.sign(prepared.frames[0]!, {
      transaction: prepared,
    })
    const request = { ...prepared, frames: [signed] }

    expect(prepared).toEqual(before)
    expect(signed).not.toBe(prepared.frames[0])
    expect(await Frame.sign(signed, { transaction: request })).toBe(signed)
    await expect(
      Frame.sign(signed, { transaction: { ...request, chainId: 1 } }),
    ).rejects.toThrow('transaction changed')
  })

  test('rejects modified signed scope', async () => {
    const prepared = transaction()
    const signed = await Frame.sign(prepared.frames[0]!, {
      transaction: prepared,
    })

    expect(() =>
      resolve({
        ...prepared,
        frames: [{ ...signed, flags: 'approvePayment' }],
      }),
    ).toThrow('transaction changed')
  })
})

test('rejects ambiguous signature slots', async () => {
  const gas = { executionGas: 50_000n, stateGas: 0n }
  const { signatures: _, ...base } =
    transaction() as TransactionSerializableEIP8141
  await expect(
    account.signTransaction({
      ...base,
      frames: [verify({ account, ...gas }), verify({ account, ...gas })],
    }),
  ).rejects.toThrow('signature index 0')

  expect(() =>
    resolve({
      ...transaction(),
      signatures: [{ scheme: 'arbitrary', signature: '0x' }],
    } satisfies TransactionSerializableEIP8141),
  ).toThrow('through the signing frames')
})

test('account signing serializes frame witnesses through a custom serializer', async () => {
  const serialized = await account.signTransaction(transaction(), {
    serializer(request) {
      expect(request.signatures?.[0]).toMatchObject({
        scheme: 'secp256k1',
        signature: expect.stringMatching(/^0x[0-9a-f]{130}$/),
        signer: account.address,
      })
      return serializeTransaction(request)
    },
  })

  expect(parseTransaction(serialized).type).toBe('eip8141')
})

test('custom frames resolve and sign multiple allocated entries', async () => {
  const custom = Frame.from(({ signatureIndex }) => {
    return {
      frame: {
        mode: 'default',
        executionGas: 50_000n,
        stateGas: 0n,
        data: concatHex(
          [signatureIndex, signatureIndex + 1].map((index) =>
            numberToHex(index, { size: 1 }),
          ),
        ),
      },
      signatures: ['0xaa', '0xbb'].map((value, index) => ({
        scheme: 'arbitrary' as const,
        async sign({
          signatureIndex,
          transaction,
        }: Parameters<Frame.Signature['sign']>[0]) {
          expect(signatureIndex).toBe(index + 1)
          expect(transaction.frames[1]?.data).toBe('0x0102')
          expect(transaction.nonce).toBe(0)
          return value as `0x${string}`
        },
      })),
    }
  })
  const prepared = resolve({
    ...transaction(),
    frames: [...transaction().frames, custom],
  })
  expect(prepared.frames[1]?.data).toBe('0x0102')

  const signed = await Frame.sign(prepared.frames[1]!, {
    transaction: prepared,
  })
  const serialized = await account.signTransaction({
    ...prepared,
    frames: [prepared.frames[0]!, signed],
  })

  expect(parseTransaction(serialized).signatures?.slice(1)).toEqual([
    { payload: '0x', scheme: 'arbitrary', signature: '0xaa' },
    { payload: '0x', scheme: 'arbitrary', signature: '0xbb' },
  ])
})

test('rejects an invalid signature value from an entry', async () => {
  const frame = Frame.from(() => {
    return {
      frame: { mode: 'default', executionGas: 50_000n, stateGas: 0n },
      signatures: [
        {
          scheme: 'arbitrary',
          async sign() {
            return '0xa'
          },
        },
      ],
    }
  })
  const { signatures: _, ...base } =
    transaction() as TransactionSerializableEIP8141
  const prepared = resolve({ ...base, frames: [frame] })
  await expect(
    Frame.sign(prepared.frames[0]!, { transaction: prepared }),
  ).rejects.toThrow()
})

test('unsigned helpers do not consume signature slots', async () => {
  const unsigned = Frame.from(({ signatureIndex }) => {
    return {
      frame: {
        mode: 'sender',
        executionGas: 100n,
        stateGas: 0n,
        data: numberToHex(signatureIndex, { size: 1 }),
      },
    }
  })
  const signer = Frame.from(({ signatureIndex }) => {
    return {
      frame: {
        mode: 'default',
        executionGas: 100n,
        stateGas: 0n,
        data: numberToHex(signatureIndex, { size: 1 }),
      },
      signatures: [
        {
          scheme: 'arbitrary',
          async sign({ signatureIndex }) {
            return numberToHex(signatureIndex, { size: 1 })
          },
        },
      ],
    }
  })
  const prepared = resolve({
    ...transaction(),
    frames: [...transaction().frames, unsigned, signer],
  })
  expect(prepared.frames.slice(1).map((frame) => frame.data)).toEqual([
    '0x01',
    '0x01',
  ])
  const serialized = await account.signTransaction(prepared)
  expect(parseTransaction(serialized).signatures).toHaveLength(2)
})

test('retains filled gas and prepared calldata through signing', async () => {
  const definition = () => {
    return { frame: { mode: 'sender' as const, data: '0x1234' as const } }
  }
  const prepared = resolve({
    ...transaction(),
    frames: [...transaction().frames, Frame.from(definition)],
  })
  const filled = {
    ...prepared,
    frames: [
      prepared.frames[0]!,
      { ...prepared.frames[1]!, executionGas: 100n, stateGas: 0n },
    ],
  }
  const resolved = resolve(filled)
  expect(resolved.frames[1]).toMatchObject({
    data: '0x1234',
    executionGas: 100n,
    stateGas: 0n,
  })
  const serialized = await account.signTransaction(resolved)
  expect(parseTransaction(serialized).frames?.[1]).toMatchObject({
    data: '0x1234',
    executionGas: 100n,
    stateGas: 0n,
  })
  expect(prepared.frames[1]).not.toHaveProperty('executionGas')
})

test('requires signing for declared entries', () => {
  // @ts-expect-error A prepared entry requires its own signing callback.
  const frame = Frame.from(() => {
    return {
      frame: { mode: 'default' },
      signatures: [{ scheme: 'arbitrary' }],
    }
  })
  expect(() => resolve({ frames: [frame] })).toThrow(
    'must provide a sign callback',
  )
})

test('signing callbacks cannot replace their prepared metadata', async () => {
  const entry: Frame.Signature = {
    scheme: 'arbitrary',
    payload: '0x',
    async sign() {
      entry.payload = `0x${'22'.repeat(32)}`
      return '0xaa'
    },
  }
  const frame = Frame.from(() => {
    return {
      frame: { mode: 'default', executionGas: 100n, stateGas: 0n },
      signatures: [entry],
    }
  })
  const { signatures: _, ...base } =
    transaction() as TransactionSerializableEIP8141
  const prepared = resolve({ ...base, frames: [frame] })
  const signed = await Frame.sign(prepared.frames[0]!, {
    transaction: prepared,
  })
  expect(resolve({ ...prepared, frames: [signed] })).toMatchObject({
    signatures: [{ scheme: 'arbitrary', signature: '0xaa', payload: '0x' }],
  })
})

describe('from', () => {
  test('expands multiple frames and preserves explicit signatures', () => {
    const signatures = [{ scheme: 'secp256k1' as const }]
    const prepared = resolve({
      frames: [
        Frame.from(() => ({
          frames: [
            { mode: 'sender', to: account.address, value: 1n },
            { mode: 'sender', to: account.address, value: 2n },
          ],
        })),
      ],
      signatures,
    })
    expect(prepared.frames).toEqual([
      { mode: 'sender', to: account.address, value: 1n },
      { mode: 'sender', to: account.address, value: 2n },
    ])
    expect(prepared.signatures).toBe(signatures)
    expect(resolve(prepared)).toBe(prepared)
  })

  test('resolves approval peers after a multi-frame expansion', () => {
    const prepared = resolve({
      frames: [
        calls([{ value: 1n }, { value: 2n }]),
        verify({ account }),
        Frame.from(() => ({
          frame: {
            flags: 'approvePayment',
            mode: 'verify',
            to: account.address,
          },
          signatures: [
            {
              scheme: 'secp256k1',
              signer: account.address,
              async sign({ hash }) {
                return account.sign({ hash })
              },
            },
          ],
        })),
      ],
    })
    expect(prepared.frames[2]?.flags).toBe('approveExecution')
    expect(prepared.frames[3]?.flags).toBe('approvePayment')
  })
})
