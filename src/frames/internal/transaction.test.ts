import { describe, expect, test } from 'vitest'
import type { FrameSignature, Frame as FrameType } from '../../types/frame.js'
import type { Hex } from '../../types/misc.js'
import * as Frame from '../Frame.js'
import { getHash, resolve, signFrame, type Transaction } from './transaction.js'

const gas = { executionGas: 50_000n, stateGas: 0n }

function transaction(frames: readonly FrameType[] = []): Transaction {
  return resolve({
    chainId: 8141,
    frames,
    maxFeePerGas: 20n,
    maxPriorityFeePerGas: 1n,
    nonce: 0,
    sender: '0x0000000000000000000000000000000000000001',
  })
}

describe('resolve', () => {
  test('preserves requests without helpers', () => {
    for (const request of [
      {},
      { frames: [] },
      { frames: [{ mode: 'sender' as const }] },
    ])
      expect(resolve(request)).toBe(request)
  })

  test('prepares with resolved peers and caches the result without signing', () => {
    const observed: (string | undefined)[][] = []
    let signed = false
    const frame = Frame.from(({ frames }) => {
      observed.push(frames.map(({ data }) => data))
      return {
        frame: { ...gas, mode: 'default', data: frames[1]?.data ?? '0x' },
        signatures: [
          {
            scheme: 'arbitrary',
            async sign() {
              signed = true
              return '0xaa'
            },
          },
        ],
      }
    })
    const prepared = transaction([
      frame,
      Frame.from(() => ({ frame: { ...gas, data: '0x1234' } })),
    ])

    expect(observed).toEqual([
      [undefined, undefined],
      ['0x', '0x1234'],
    ])
    expect(prepared.frames[0]?.data).toBe('0x1234')
    expect(resolve(prepared).frames[0]?.data).toBe('0x1234')
    expect(observed).toHaveLength(2)
    expect(signed).toBe(false)
  })

  test('rejects signature metadata changed during preparation', () => {
    let pass = 0
    const frame = Frame.from(() => ({
      frame: { ...gas },
      signatures: [
        {
          scheme: 'arbitrary',
          payload: (++pass === 1 ? '0x' : `0x${'11'.repeat(32)}`) as Hex,
          async sign() {
            return '0xaa'
          },
        },
      ],
    }))

    expect(() => transaction([frame])).toThrow(
      'preserve the allocated signature entries',
    )
  })

  test('rejects switching to expansion during preparation', () => {
    let pass = 0
    const frame = Frame.from(() =>
      ++pass === 1 ? { frame: { ...gas } } : { frames: [] },
    )

    expect(() => transaction([frame])).toThrow('preserve its return shape')
  })

  test('rejects a signing callback removed during preparation', () => {
    let pass = 0
    const frame = Frame.from(() => ({
      frame: { ...gas },
      signatures: [
        {
          scheme: 'arbitrary',
          sign: (++pass === 1
            ? async () => '0xaa'
            : undefined) as Frame.Signature['sign'],
        },
      ],
    }))

    expect(() => transaction([frame])).toThrow('must provide a sign callback')
  })

  test.each<FrameSignature[]>([
    [{ scheme: 'arbitrary', signature: '0xab' }],
    [{ scheme: 'arbitrary', payload: `0x${'11'.repeat(32)}`, signature: '0x' }],
    [
      { scheme: 'arbitrary', signature: '0x' },
      { scheme: 'arbitrary', signature: '0x' },
    ],
  ])('rejects externally supplied signature changes: %j', (...signatures) => {
    const prepared = transaction([
      Frame.from(() => ({
        frame: { ...gas },
        signatures: [
          {
            scheme: 'arbitrary',
            async sign() {
              return '0xaa'
            },
          },
        ],
      })),
    ])

    expect(() => resolve({ ...prepared, signatures })).toThrow(
      'through the signing frames',
    )
  })
})

describe('getHash', () => {
  test.each([
    'chainId',
    'nonce',
    'maxFeePerGas',
    'maxPriorityFeePerGas',
  ] as const)('requires %s', (field) => {
    expect(() => getHash({ ...transaction(), [field]: undefined })).toThrow(
      'Prepare the transaction',
    )
  })

  test.each(['executionGas', 'stateGas'] as const)(
    'requires frame %s',
    (field) => {
      expect(() =>
        getHash(transaction([{ ...gas, [field]: undefined }])),
      ).toThrow('Prepare the transaction')
    },
  )

  test('witness bytes do not change the canonical hash', () => {
    const prepared = {
      ...transaction([{ ...gas }]),
      signatures: [{ scheme: 'arbitrary' as const, signature: '0x' as const }],
    }

    expect(
      getHash({
        ...prepared,
        signatures: [{ scheme: 'arbitrary', signature: '0xaabb' }],
      }),
    ).toBe(getHash(prepared))
    expect(getHash({ ...prepared, nonce: 1 })).not.toBe(getHash(prepared))
  })
})

describe('signFrame', () => {
  test('signs entries sequentially with allocated indices and one hash', async () => {
    const events: string[] = []
    const hashes: Hex[] = []
    const prepared = transaction([
      Frame.from(() => ({
        frame: { ...gas },
        signatures: [0, 1].map((index) => ({
          scheme: 'arbitrary' as const,
          async sign({
            hash,
            signatureIndex,
          }: Parameters<Frame.Signature['sign']>[0]) {
            events.push(`start:${signatureIndex}`)
            await Promise.resolve()
            hashes.push(hash)
            events.push(`end:${signatureIndex}`)
            return index === 0 ? ('0xaa' as const) : ('0xbb' as const)
          },
        })),
      })),
    ])
    const signed = await signFrame(prepared.frames[0]!, prepared)
    const result = resolve({ ...prepared, frames: [signed] })

    expect(events).toEqual(['start:0', 'end:0', 'start:1', 'end:1'])
    expect(hashes).toEqual([getHash(prepared), getHash(prepared)])
    expect(result.signatures?.map(({ signature }) => signature)).toEqual([
      '0xaa',
      '0xbb',
    ])
    expect(prepared.signatures?.map(({ signature }) => signature)).toEqual([
      '0x',
      '0x',
    ])
    expect(await signFrame(result.frames[0]!, result)).toBe(result.frames[0])
    expect(events).toHaveLength(4)
    expect(() => resolve({ ...result, nonce: 1 })).toThrow(
      'transaction changed',
    )
  })

  test.each([undefined, null])(
    'rejects missing signature %s',
    async (signature) => {
      const prepared = transaction([
        Frame.from(() => ({
          frame: { ...gas },
          signatures: [
            {
              scheme: 'arbitrary',
              async sign() {
                return signature as never
              },
            },
          ],
        })),
      ])

      await expect(signFrame(prepared.frames[0]!, prepared)).rejects.toThrow(
        'must return a signature value',
      )
    },
  )

  test('rejects raw frames even when they belong to the transaction', async () => {
    const prepared = transaction([{ ...gas }])

    await expect(signFrame(prepared.frames[0]!, prepared)).rejects.toThrow(
      'Expected a signing frame',
    )
  })
})
