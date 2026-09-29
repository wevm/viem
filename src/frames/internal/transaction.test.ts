import * as Signature_ox from 'ox/Signature'
import * as TxEnvelopeEip8141 from 'ox/TxEnvelopeEip8141'
import { parseTransaction, recoverAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { describe, expect, test } from 'vitest'
import type { FrameSignature, Frame as FrameType } from '../../types/frame.js'
import type { Hex } from '../../types/misc.js'
import * as Frame from '../Frame.js'
import {
  applyDataSuffix,
  resolve,
  signFrame,
  type Transaction,
} from './transaction.js'

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
  test.each([
    Frame.calls([{ value: 1n }]),
    Frame.expiry(1),
    Frame.from(() => ({ frame: { mode: 'sender' } })),
  ])('rejects nested builders', (frame) => {
    expect(() =>
      resolve({ frames: [Frame.from(() => ({ frames: [frame] }))] }),
    ).toThrow('Frame expansions must contain explicit frames, not builders.')
  })

  test('preserves requests without helpers', () => {
    for (const request of [
      {},
      { frames: [] },
      { frames: [{ mode: 'sender' as const }] },
    ])
      expect(resolve(request)).toEqual({
        ...request,
        ...('frames' in request ? { nonceKeys: [0n] } : {}),
      })
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

describe('signFrame', () => {
  test('signs explicit payloads before canonical signatures', async () => {
    const account = privateKeyToAccount(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    )
    const payload = `0x${'11'.repeat(32)}` as Hex
    const request = transaction([
      Frame.verify({ account, ...gas }),
      Frame.from(() => ({
        frame: { mode: 'default', ...gas },
        signatures: [
          {
            scheme: 'secp256k1',
            signer: account.address,
            payload,
            sign: account.sign,
          },
        ],
      })),
    ])
    const parsed = parseTransaction(
      await account.signTransaction({ ...request, sender: account.address }),
    )
    if (parsed.type !== 'eip8141')
      throw new Error('Expected frame transaction.')
    for (const [index, entry] of parsed.signatures!.entries()) {
      if (entry.scheme !== 'secp256k1' || !entry.signature)
        throw new Error('Expected signature.')
      expect(
        await recoverAddress({
          hash:
            index === 0
              ? TxEnvelopeEip8141.getSignPayload({
                  ...parsed,
                  nonce: BigInt(parsed.nonce ?? 0),
                })
              : payload,
          signature:
            typeof entry.signature === 'string'
              ? entry.signature
              : Signature_ox.toHex(entry.signature),
        }),
      ).toBe(account.address)
    }
  })

  test('requires explicit payload witnesses before manual canonical signing', async () => {
    const prepared = transaction([
      Frame.from(() => ({
        frame: { ...gas },
        signatures: [{ scheme: 'arbitrary', sign: async () => '0xaa' }],
      })),
      Frame.from(() => ({
        frame: { ...gas },
        signatures: [
          {
            scheme: 'arbitrary',
            payload: `0x${'11'.repeat(32)}`,
            sign: async () => '0xbb',
          },
        ],
      })),
    ])
    await expect(signFrame(prepared.frames[0]!, prepared)).rejects.toThrow(
      'Sign explicit-payload frames before transaction-hash frames.',
    )
    const explicit = await signFrame(prepared.frames[1]!, prepared)
    const ready = resolve({
      ...prepared,
      frames: [prepared.frames[0]!, explicit],
    })
    const canonical = await signFrame(ready.frames[0]!, ready)
    expect(
      resolve({ ...ready, frames: [canonical, explicit] }).signatures?.map(
        ({ signature }) => signature,
      ),
    ).toMatchInlineSnapshot(`
      [
        "0xaa",
        "0xbb",
      ]
    `)
  })

  test.each([
    'chainId',
    'nonce',
    'maxFeePerGas',
    'maxPriorityFeePerGas',
  ] as const)('requires %s', async (field) => {
    const prepared = transaction([Frame.from(() => ({ frame: { ...gas } }))])

    await expect(
      signFrame(prepared.frames[0]!, { ...prepared, [field]: undefined }),
    ).rejects.toThrow('Prepare the transaction')
  })

  test.each(['executionGas', 'stateGas'] as const)(
    'requires frame %s',
    async (field) => {
      const prepared = transaction([
        Frame.from(() => ({ frame: { ...gas, [field]: undefined } })),
      ])

      await expect(signFrame(prepared.frames[0]!, prepared)).rejects.toThrow(
        'Prepare the transaction',
      )
    },
  )

  test('witness bytes do not change the canonical hash', async () => {
    const hashes: Hex[] = []
    const prepared = transaction([
      Frame.from(() => ({
        frame: { ...gas },
        signatures: [
          {
            scheme: 'arbitrary',
            async sign({ hash }) {
              hashes.push(hash)
              return '0xaabb'
            },
          },
        ],
      })),
    ])
    const signed = await signFrame(prepared.frames[0]!, prepared)
    const result = resolve({ ...prepared, frames: [signed] })

    expect(hashes).toEqual([
      TxEnvelopeEip8141.getSignPayload({
        ...result,
        nonce: BigInt(result.nonce!),
      }),
    ])
    expect(result.signatures?.[0]?.signature).toBe('0xaabb')
    expect(() => resolve({ ...result, nonce: 1 })).toThrow(
      'transaction changed',
    )
    expect(() => resolve({ ...result, nonceKeys: [123n] })).toThrow(
      'transaction changed',
    )
  })

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
    const hash = TxEnvelopeEip8141.getSignPayload({
      ...prepared,
      nonce: BigInt(prepared.nonce!),
    })
    expect(hashes).toEqual([hash, hash])
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
    expect(() => resolve({ ...result, nonceKeys: [123n] })).toThrow(
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

describe('applyDataSuffix', () => {
  test('appends once to sender frames and preserves per-call overrides', () => {
    const request = resolve({
      frames: [
        Frame.calls([
          { data: '0x12' },
          { data: '0x34', dataSuffix: '0xab' },
          { data: '0x56', dataSuffix: '0x' },
          { dataSuffix: '0xcd' },
        ]),
        { mode: 2, data: '0x78' },
        { mode: 'verify', data: '0x90' },
        { mode: 'default', data: '0x11' },
        { mode: 'sender' },
      ] as const,
    })
    const result = applyDataSuffix(request, '0xbeef')
    expect(
      result.frames.map((frame: FrameType) => frame.data),
    ).toMatchInlineSnapshot(`
      [
        "0x12beef",
        "0x34ab",
        "0x56",
        "0xcd",
        "0x78beef",
        "0x90",
        "0x11",
        "0xbeef",
      ]
    `)
    expect(applyDataSuffix(result, '0xbeef')).toEqual(result)
    expect(request.frames[0]?.data).toBe('0x12')
  })

  test('preserves signed requests', async () => {
    const account = privateKeyToAccount(`0x${'01'.repeat(32)}`)
    const request = transaction([
      Frame.verify({ account, ...gas }),
      { mode: 'sender', data: '0x12', ...gas },
    ])
    request.sender = account.address
    const frame = await signFrame(request.frames[0]!, request)
    const signed = resolve({ ...request, frames: [frame, request.frames[1]!] })
    expect(applyDataSuffix(signed, '0xbeef')).toBe(signed)
    const explicit = {
      frames: [{ mode: 'sender' as const }],
      signatures: [
        { scheme: 'arbitrary' as const, signature: '0xab' as const },
      ],
    }
    expect(applyDataSuffix(explicit, '0xbeef')).toBe(explicit)
  })
})
