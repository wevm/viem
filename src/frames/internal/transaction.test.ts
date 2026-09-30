import * as Signature_ox from 'ox/Signature'
import * as TxEnvelopeEip8141 from 'ox/TxEnvelopeEip8141'
import { parseTransaction, recoverAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { describe, expect, test } from 'vitest'
import type { FrameSignature, Frame as FrameType } from '../../types/frame.js'
import type { Hex } from '../../types/misc.js'
import * as Frame from '../Frame.js'
import * as FrameTransaction from './transaction.js'

const gas = { executionGas: 50_000n, stateGas: 0n }

function transaction(
  frames: readonly Frame.Input[] = [],
): FrameTransaction.Transaction {
  return FrameTransaction.resolve({
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
      FrameTransaction.resolve({
        frames: [
          Frame.from(() => ({
            // @ts-expect-error Expansions must contain protocol frames, not definitions.
            frames: [frame],
          })),
        ],
      }),
    ).toThrow(
      'Frame.from: `frames` must contain protocol frame objects, without callbacks or signed frame envelopes.',
    )
  })

  test('preserves requests without helpers', () => {
    for (const request of [
      {},
      { frames: [] },
      { frames: [{ mode: 'sender' as const }] },
    ])
      expect(FrameTransaction.resolve(request)).toEqual({
        ...request,
        ...('frames' in request ? { nonceKeys: [0n] } : {}),
      })
  })

  test('prepares with resolved peers and caches the result without signing', () => {
    const observed: (string | undefined)[][] = []
    let signed = false
    const frame = Frame.from((options) => {
      const { entries } = options

      const frames = entries.map((entry) => entry.frame)
      observed.push(
        frames.map((frame) => {
          const { data } = frame
          return data
        }),
      )
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
    expect(FrameTransaction.resolve(prepared).frames[0]?.data).toBe('0x1234')
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
      'Frame.from: preparation passes must preserve signature count, scheme, signer, and payload.',
    )
  })

  test('rejects switching to expansion during preparation', () => {
    let pass = 0
    const frame = Frame.from(() =>
      ++pass === 1 ? { frame: { ...gas } } : { frames: [] },
    )

    expect(() => transaction([frame])).toThrow(
      'Frame.from: preparation passes must preserve the return shape and expanded frame count.',
    )
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

    expect(() => transaction([frame])).toThrow(
      'Frame.from: each `signatures` entry must define a `sign` function.',
    )
  })

  test.each<FrameSignature[]>([
    [{ scheme: 'arbitrary', payload: `0x${'11'.repeat(32)}`, signature: '0x' }],
    [
      { scheme: 'arbitrary', signature: '0x' },
      { scheme: 'arbitrary', signature: '0x' },
    ],
  ])('rejects changes to allocated signature metadata: %j', (...signatures) => {
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

    expect(() => FrameTransaction.resolve({ ...prepared, signatures })).toThrow(
      'Frame.from: transaction `signatures` conflict with the declared frame signature allocations. Supply signatures through frame signing callbacks.',
    )
  })
})

describe('Frame.sign', () => {
  test.each([false, true])(
    'allocates reused shared frames independently (expanded: %s)',
    async (expanded) => {
      const shared = { ...gas, mode: 'sender' as const }
      const helper = Frame.from(() => ({
        ...(expanded ? { frames: [shared] } : { frame: shared }),
        signatures: [
          {
            scheme: 'arbitrary',
            async sign(context) {
              return context.signatureIndex === 0 ? '0xaa' : '0xbb'
            },
          },
        ],
      }))
      const prepared = transaction([helper, helper])
      expect(prepared.frames[0]).not.toBe(prepared.frames[1])
      expect(prepared.frames[1]).not.toBe(shared)
      const second = await Frame.sign(prepared.frames[1]!, {
        transaction: prepared,
      })
      expect(second.signatureIndex).toBe(1)
      const signed = FrameTransaction.resolve({
        ...prepared,
        frames: [prepared.frames[0]!, second],
      })
      const first = await Frame.sign(signed.frames[0]!, { transaction: signed })
      expect(first.signatures[0]!.signature).toBe('0xaa')
      expect(second.signatures[0]!.signature).toBe('0xbb')
      const account = privateKeyToAccount(
        '0x0123456789012345678901234567890123456789012345678901234567890123',
      )
      const serialized = await account.signTransaction(prepared)
      expect(
        parseTransaction(serialized).signatures?.map(
          (entry) => entry.signature,
        ),
      ).toEqual(['0xaa', '0xbb'])
    },
  )

  test('reuses completed transaction slots without storing witnesses in entries', async () => {
    let count = 0
    const prepared = transaction([
      Frame.from(() => ({
        frame: { ...gas },
        signatures: [0, 1].map(() => ({
          scheme: 'arbitrary' as const,
          async sign() {
            count++
            return '0xbb' as const
          },
        })),
      })),
    ])
    const request = {
      ...prepared,
      signatures: [
        { scheme: 'arbitrary' as const, signature: '0xaa' as const },
        prepared.signatures![1]!,
      ],
    }
    const signed = await Frame.sign(request.frames[0]!, {
      transaction: request,
    })
    const result = FrameTransaction.resolve({ ...request, frames: [signed] })
    expect(result.signatures?.map((entry) => entry.signature)).toEqual([
      '0xaa',
      '0xbb',
    ])
    expect(count).toBe(1)
    expect(result.frames).toEqual(prepared.frames)
    expect(
      result.frameContext?.entries[0]?.signatures.every(
        (entry) => !('signature' in entry),
      ),
    ).toBe(true)
    expect(prepared.signatures?.map((entry) => entry.signature)).toEqual([
      '0x',
      '0x',
    ])
  })

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
    await expect(
      Frame.sign(prepared.frames[0]!, { transaction: prepared }),
    ).rejects.toThrow(
      'Frame.sign: explicit-payload signatures must be populated before canonical transaction-hash signatures.',
    )
    const explicit = await Frame.sign(prepared.frames[1]!, {
      transaction: prepared,
    })
    const ready = FrameTransaction.resolve({
      ...prepared,
      frames: [prepared.frames[0]!, explicit],
    })
    const canonical = await Frame.sign(ready.frames[0]!, { transaction: ready })
    expect(
      FrameTransaction.resolve({
        ...ready,
        frames: [canonical, ready.frames[1]!],
      }).signatures?.map((frame) => {
        const { signature } = frame
        return signature
      }),
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
      Frame.sign(prepared.frames[0]!, {
        transaction: { ...prepared, [field]: undefined },
      }),
    ).rejects.toThrow(
      'Frame.sign: transaction hashing requires `chainId`, `nonce`, fee parameters, and execution/state gas budgets for every frame. Call `prepareTransactionRequest` first.',
    )
  })

  test.each(['executionGas', 'stateGas'] as const)(
    'requires frame %s',
    async (field) => {
      const prepared = transaction([
        Frame.from(() => ({ frame: { ...gas, [field]: undefined } })),
      ])

      await expect(
        Frame.sign(prepared.frames[0]!, { transaction: prepared }),
      ).rejects.toThrow(
        'Frame.sign: transaction hashing requires `chainId`, `nonce`, fee parameters, and execution/state gas budgets for every frame. Call `prepareTransactionRequest` first.',
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
            async sign(options) {
              const { hash } = options

              hashes.push(hash)
              return '0xaabb'
            },
          },
        ],
      })),
    ])
    const signed = await Frame.sign(prepared.frames[0]!, {
      transaction: prepared,
    })
    const result = FrameTransaction.resolve({ ...prepared, frames: [signed] })

    expect(hashes).toEqual([
      TxEnvelopeEip8141.getSignPayload({
        ...result,
        nonce: BigInt(result.nonce!),
      }),
    ])
    expect(result.signatures?.[0]?.signature).toBe('0xaabb')
    expect(() => FrameTransaction.resolve({ ...result, nonce: 1 })).toThrow(
      'Frame.sign: transaction hash differs from the signed frame hash. Prepare and sign the modified transaction again.',
    )
    expect(() =>
      FrameTransaction.resolve({ ...result, nonceKeys: [123n] }),
    ).toThrow(
      'Frame.sign: transaction hash differs from the signed frame hash. Prepare and sign the modified transaction again.',
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
          async sign(options: Parameters<Frame.Signature['sign']>[0]) {
            const { hash, signatureIndex } = options

            events.push(`start:${signatureIndex}`)
            await Promise.resolve()
            hashes.push(hash)
            events.push(`end:${signatureIndex}`)
            return index === 0 ? ('0xaa' as const) : ('0xbb' as const)
          },
        })),
      })),
    ])
    const signed = await Frame.sign(prepared.frames[0]!, {
      transaction: prepared,
    })
    const result = FrameTransaction.resolve({ ...prepared, frames: [signed] })

    expect(events).toEqual(['start:0', 'end:0', 'start:1', 'end:1'])
    const hash = TxEnvelopeEip8141.getSignPayload({
      ...prepared,
      nonce: BigInt(prepared.nonce!),
    })
    expect(hashes).toEqual([hash, hash])
    expect(
      result.signatures?.map((frame) => {
        const { signature } = frame
        return signature
      }),
    ).toEqual(['0xaa', '0xbb'])
    expect(
      prepared.signatures?.map((frame) => {
        const { signature } = frame
        return signature
      }),
    ).toEqual(['0x', '0x'])
    expect(
      await Frame.sign(result.frames[0]!, { transaction: result }),
    ).toEqual(signed)
    expect(events).toHaveLength(4)
    expect(() => FrameTransaction.resolve({ ...result, nonce: 1 })).toThrow(
      'Frame.sign: transaction hash differs from the signed frame hash. Prepare and sign the modified transaction again.',
    )
    expect(() =>
      FrameTransaction.resolve({ ...result, nonceKeys: [123n] }),
    ).toThrow(
      'Frame.sign: transaction hash differs from the signed frame hash. Prepare and sign the modified transaction again.',
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

      await expect(
        Frame.sign(prepared.frames[0]!, { transaction: prepared }),
      ).rejects.toThrow(
        'Frame.sign: a signature callback returned no signature value.',
      )
    },
  )

  test('rejects raw frames even when they belong to the transaction', async () => {
    const prepared = transaction([{ ...gas }])

    await expect(
      Frame.sign(prepared.frames[0]!, { transaction: prepared }),
    ).rejects.toThrow(
      'Frame.sign: `frame` must reference a prepared transaction frame with allocated signing callbacks.',
    )
  })
})

describe('applyDataSuffix', () => {
  test('preserves calldata for undefined and empty suffixes, and appends to omitted calldata', () => {
    const request = FrameTransaction.resolve({
      frames: [
        Frame.from(() => ({
          frame: { mode: 'sender', data: '0x12' },
          dataSuffix: () => undefined,
        })),
        Frame.from(() => ({
          frame: { mode: 'sender' },
          dataSuffix: () => '0x',
        })),
        Frame.from(() => ({
          frame: { mode: 'sender' },
          dataSuffix: () => '0xcd',
        })),
      ],
    })
    expect(
      FrameTransaction.applyDataSuffix(request, '0xab').frames,
    ).toMatchInlineSnapshot(`
      [
        {
          "data": "0x12",
          "mode": "sender",
        },
        {
          "mode": "sender",
        },
        {
          "data": "0xcd",
          "mode": "sender",
        },
      ]
    `)
  })

  test('appends custom suffixes with helper-local indexes and preserves raw defaults', () => {
    const request = FrameTransaction.resolve({
      frames: [
        { mode: 'sender', data: '0x00' },
        Frame.from(() => ({
          frames: [
            { mode: 'sender', data: '0x12' },
            { mode: 'default', data: '0x34' },
          ],
          dataSuffix(context) {
            const { index } = context
            return index === 0 ? undefined : '0xcd'
          },
        })),
        { mode: 'verify', data: '0x56' },
      ],
    })
    const result = FrameTransaction.applyDataSuffix(request, '0xab')
    expect(result.frames.map((frame) => frame.data)).toMatchInlineSnapshot(`
      [
        "0x00ab",
        "0x12",
        "0x34cd",
        "0x56",
      ]
    `)
    expect(
      FrameTransaction.applyDataSuffix(result, '0xab').frames,
    ).toMatchInlineSnapshot(`
      [
        {
          "data": "0x00ab",
          "mode": "sender",
        },
        {
          "data": "0x12",
          "mode": "sender",
        },
        {
          "data": "0x34cd",
          "mode": "default",
        },
        {
          "data": "0x56",
          "mode": "verify",
        },
      ]
    `)
    expect(FrameTransaction.applyDataSuffix(request, undefined)).toBe(request)
  })

  test('appends with completed explicit-payload signatures', () => {
    const request = {
      frames: [{ mode: 'sender' as const, data: '0x12' as const }],
      signatures: [
        { scheme: 'secp256k1' as const },
        {
          scheme: 'arbitrary' as const,
          payload: `0x${'11'.repeat(32)}` as Hex,
          signature: '0xab' as const,
        },
      ],
    }
    const result = FrameTransaction.applyDataSuffix(request, '0xbeef')
    expect(result.frames[0]!.data).toMatchInlineSnapshot(`"0x12beef"`)
    expect(result.signatures).toEqual(request.signatures)
    expect(FrameTransaction.applyDataSuffix(result, '0xbeef')).toEqual(result)
  })

  test('appends once to sender frames and preserves per-call overrides', () => {
    const request = FrameTransaction.resolve({
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
    const result = FrameTransaction.applyDataSuffix(request, '0xbeef')
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
    expect(FrameTransaction.applyDataSuffix(result, '0xbeef')).toEqual(result)
    expect(request.frames[0]?.data).toBe('0x12')
  })

  test('preserves signed requests', async () => {
    const account = privateKeyToAccount(`0x${'01'.repeat(32)}`)
    const request = transaction([
      Frame.verify({ account, ...gas }),
      { mode: 'sender', data: '0x12', ...gas },
    ])
    request.sender = account.address
    const frame = await Frame.sign(request.frames[0]!, { transaction: request })
    const signed = FrameTransaction.resolve({
      ...request,
      frames: [frame, request.frames[1]!],
    })
    expect(FrameTransaction.applyDataSuffix(signed, '0xbeef')).toBe(signed)
    const explicit = {
      frames: [{ mode: 'sender' as const }],
      signatures: [
        { scheme: 'arbitrary' as const, signature: '0xab' as const },
      ],
    }
    expect(FrameTransaction.applyDataSuffix(explicit, '0xbeef')).toBe(explicit)
  })
})

describe('resolveNonceKeys', () => {
  test('generates distinct, nonzero uint256 keys in ascending order', () => {
    const keys = FrameTransaction.resolveNonceKeys(['random', 1n, 'random'])
    expect(keys.length).toMatchInlineSnapshot(`3`)
    expect(keys[0]).toMatchInlineSnapshot(`1n`)
    expect(
      keys.every((key) => key > 0n && key < 2n ** 256n),
    ).toMatchInlineSnapshot(`true`)
    expect(keys[1]! < keys[2]!).toMatchInlineSnapshot(`true`)
    expect(FrameTransaction.resolveNonceKeys(keys)).toBe(keys)
    expect(
      FrameTransaction.resolveNonceKeys(['random'])[0] === keys[1],
    ).toMatchInlineSnapshot(`false`)
  })

  test('preserves explicit keys for validation', () => {
    expect(FrameTransaction.resolveNonceKeys([2n, 1n])).toMatchInlineSnapshot(`
      [
        2n,
        1n,
      ]
    `)
    expect(FrameTransaction.resolveNonceKeys()).toMatchInlineSnapshot(`
      [
        0n,
      ]
    `)
  })
})

describe('unsigned helpers', () => {
  test('preserves explicit signatures with expiry', () => {
    const signatures = [{ scheme: 'secp256k1' as const, signer: '0x' as const }]
    const request = {
      frames: [Frame.expiry(1_800_000_000), { mode: 'verify' as const }],
      signatures,
    }
    const prepared = FrameTransaction.resolve(request)
    expect(prepared.signatures).toEqual(signatures)
    expect(FrameTransaction.resolve(prepared).signatures).toEqual(signatures)
    expect(prepared.frames[0]!.data).toMatchInlineSnapshot(
      `"0x000000006b49d200"`,
    )
  })
})

describe('hasSigningFrames', () => {
  test('routes resolved unsigned post-fill hooks through local preparation', () => {
    const prepared = FrameTransaction.resolve({
      frames: [
        Frame.from(() => ({
          frame: { mode: 'sender' },
          async afterFill() {
            return undefined
          },
        })),
      ],
    })
    expect(FrameTransaction.hasSigningFrames(prepared)).toBe(true)
    expect(
      FrameTransaction.hasSigningFrames({ frames: [{ mode: 'sender' }] }),
    ).toBe(false)
  })
})

describe('getSimulationSignatures', () => {
  test.each(['arbitrary', 0] as const)(
    'preserves real signatures for scheme %s',
    async (scheme) => {
      const prepared = transaction([
        Frame.from(() => ({
          frame: { ...gas, mode: 'sender' },
          signatures: [
            { scheme, placeholder: '0xaabb', sign: async () => '0xccdd' },
          ],
        })),
      ])
      expect(
        FrameTransaction.getSimulationSignatures(prepared)?.[0]?.signature,
      ).toMatchInlineSnapshot('"0xaabb"')
      expect(prepared.signatures?.[0]?.signature).toMatchInlineSnapshot('"0x"')
      const frame = await Frame.sign(prepared.frames[0]!, {
        transaction: prepared,
      })
      const signed = FrameTransaction.resolve({ ...prepared, frames: [frame] })
      expect(
        FrameTransaction.getSimulationSignatures(signed)?.[0]?.signature,
      ).toMatchInlineSnapshot('"0xccdd"')
      expect(
        TxEnvelopeEip8141.getSignPayload({
          ...prepared,
          nonce: BigInt(prepared.nonce!),
        }),
      ).toBe(
        TxEnvelopeEip8141.getSignPayload({
          ...signed,
          nonce: BigInt(signed.nonce!),
        }),
      )
    },
  )

  test('preserves requests without placeholders', () => {
    const signatures = [
      { scheme: 'arbitrary' as const, signature: '0xaabb' as const },
    ]
    expect(FrameTransaction.getSimulationSignatures({ signatures })).toBe(
      signatures,
    )
    expect(FrameTransaction.getSimulationSignatures({})).toMatchInlineSnapshot(
      'undefined',
    )
  })
})

describe('signing expansions', () => {
  const signature: Frame.Signature = {
    scheme: 'secp256k1',
    signer: '0x0000000000000000000000000000000000000001',
    sign: async () => '0xaa',
  }

  test('prepares unsigned expansions after peer names are available', () => {
    const prepared = FrameTransaction.resolve({
      frames: [
        Frame.from((context) => ({
          frames: [
            {
              mode: 'sender',
              data: context.entries.some((entry) => entry.name === 'peer')
                ? '0x01'
                : '0x00',
            },
          ],
        })),
        Frame.from(() => ({ name: 'peer', frame: { mode: 'sender' } })),
      ],
    })
    expect(prepared.frames[0]!.data).toMatchInlineSnapshot('"0x01"')
    expect(prepared.frameContext!.entries[0]!.frameCount).toBe(1)
    expect(prepared.frameContext!.entries[0]!.prepare).toBeTypeOf('function')
  })

  test('allows empty unsigned expansions', () => {
    expect(
      FrameTransaction.resolve({ frames: [Frame.from(() => ({ frames: [] }))] })
        .frames,
    ).toEqual([])
  })

  test('requires a frame for declared signatures', () => {
    expect(() =>
      FrameTransaction.resolve({
        frames: [Frame.from(() => ({ frames: [], signatures: [signature] }))],
      }),
    ).toThrow(
      'Frame.from: a nonempty `signatures` array requires at least one protocol frame.',
    )
  })

  test('allocates signatures to the first expanded frame', () => {
    const prepared = FrameTransaction.resolve({
      frames: [
        Frame.from(() => ({
          frames: [{ mode: 'verify' }, { mode: 'sender' }],
          signatures: [signature],
          dataSuffix(context) {
            return context.index === 0 ? undefined : context.suffix
          },
        })),
        Frame.from(() => ({
          frame: { mode: 'verify' },
          signatures: [signature],
        })),
      ],
    })
    expect(
      FrameTransaction.applyDataSuffix(prepared, '0xbeef').frames.map(
        (frame) => frame.data,
      ),
    ).toMatchInlineSnapshot(`
      [
        undefined,
        "0xbeef",
        undefined,
      ]
    `)
    expect(
      prepared.frameContext?.entries.map((entry) => !!entry.dataSuffix),
    ).toMatchInlineSnapshot(`
      [
        true,
        true,
        false,
      ]
    `)
    expect(
      prepared.frameContext?.entries.map((frame) => {
        const { frameIndex, signatureIndex, signatures } = frame
        return {
          frameIndex,
          signatureIndex,
          count: signatures.length,
        }
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "count": 1,
          "frameIndex": 0,
          "signatureIndex": 0,
        },
        {
          "count": 0,
          "frameIndex": 1,
          "signatureIndex": 1,
        },
        {
          "count": 1,
          "frameIndex": 2,
          "signatureIndex": 1,
        },
      ]
    `)
  })

  test.each(['count', 'shape'] as const)(
    'rejects a changing expansion %s',
    (change) => {
      let count = 0
      const definition = Frame.from(() => {
        count++
        if (count === 2 && change === 'shape')
          return { frame: { mode: 'verify' }, signatures: [signature] }
        return {
          frames:
            count === 2
              ? [{ mode: 'verify' }]
              : [{ mode: 'verify' }, { mode: 'sender' }],
          signatures: [signature],
        }
      })
      expect(() => FrameTransaction.resolve({ frames: [definition] })).toThrow(
        'Frame.from: preparation passes must preserve the return shape and expanded frame count.',
      )
    },
  )
})
