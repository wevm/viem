import fc from 'fast-check'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { fuzzParameters } from '~test/tempo/fuzz.js'
import { maxUint256 } from '../constants/number.js'
import { chainConfig } from './chainConfig.js'

const now = 1_800_000_000

const nonceMode = fc.oneof(
  fc.constant({ kind: 'automatic' } as const),
  fc.constant({ kind: 'expiring' } as const),
  fc
    .oneof(fc.bigInt({ min: 0n, max: 1_000n }), fc.constant(maxUint256))
    .map((value) => ({ kind: 'explicit' as const, value })),
)

const request = fc.record({
  account: fc.integer({ min: 0, max: 3 }),
  feePayer: fc.boolean(),
  nonce: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
  nonceMode,
  validAfter: fc.option(fc.integer({ min: now - 100, max: now + 100 }), {
    nil: undefined,
  }),
  validBefore: fc.option(fc.integer({ min: now - 100, max: now + 100 }), {
    nil: undefined,
  }),
})

function address(index: number) {
  return `0x${(index + 1).toString(16).padStart(40, '0')}`
}

describe('prepareTransactionRequest: fuzz', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(now * 1_000)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('preserves explicit 2D nonces and isolates automatic concurrency', async () => {
    const prepare = chainConfig.prepareTransactionRequest[0]

    await fc.assert(
      fc.asyncProperty(
        fc.array(request, { minLength: 1, maxLength: 20 }),
        async (requests) => {
          const automaticCounts = new Map<number, number>()
          for (const request of requests) {
            if (request.nonceMode.kind === 'automatic' && !request.feePayer)
              automaticCounts.set(
                request.account,
                (automaticCounts.get(request.account) ?? 0) + 1,
              )
          }

          const prepared = await Promise.all(
            requests.map((request) => {
              const nonceKey = (() => {
                if (request.nonceMode.kind === 'automatic') return undefined
                if (request.nonceMode.kind === 'expiring') return 'expiring'
                return request.nonceMode.value
              })()

              return prepare(
                {
                  account: { address: address(request.account) },
                  ...(request.feePayer ? { feePayer: true } : {}),
                  ...(typeof nonceKey !== 'undefined' ? { nonceKey } : {}),
                  ...(typeof request.nonce !== 'undefined'
                    ? { nonce: request.nonce }
                    : {}),
                  ...(typeof request.validAfter !== 'undefined'
                    ? { validAfter: request.validAfter }
                    : {}),
                  ...(typeof request.validBefore !== 'undefined'
                    ? { validBefore: request.validBefore }
                    : {}),
                } as never,
                { client: {} as never, phase: 'beforeFillTransaction' },
              )
            }),
          )

          for (const [index, input] of requests.entries()) {
            const output = prepared[index] as {
              nonce?: number | undefined
              nonceKey?: bigint | undefined
              validAfter?: number | undefined
              validBefore?: number | undefined
            }
            const isConcurrentAutomatic =
              input.nonceMode.kind === 'automatic' &&
              !input.feePayer &&
              (automaticCounts.get(input.account) ?? 0) > 1
            const isExpiring =
              input.nonceMode.kind === 'expiring' ||
              (input.nonceMode.kind === 'explicit' &&
                input.nonceMode.value === maxUint256) ||
              (input.nonceMode.kind === 'automatic' && input.feePayer) ||
              isConcurrentAutomatic

            if (isExpiring) {
              expect(output.nonceKey).toBe(maxUint256)
              expect(output.nonce).toBe(0)
              if (typeof input.validAfter === 'number')
                expect(output.validAfter).toBe(input.validAfter)
              else {
                expect(output.validAfter).toBeGreaterThanOrEqual(0)
                expect(output.validAfter).toBeLessThan(now - 60)
              }
              expect(output.validBefore).toBe(input.validBefore ?? now + 25)
              continue
            }

            if (input.nonceMode.kind === 'explicit') {
              expect(output.nonceKey).toBe(input.nonceMode.value)
              expect(output.nonce).toBe(input.nonce ?? 0)
            } else {
              expect(output.nonceKey).toBeUndefined()
              expect(output.nonce).toBe(input.nonce)
            }
            expect(output.validAfter).toBe(input.validAfter)
            expect(output.validBefore).toBe(input.validBefore)
          }

          await Promise.resolve()
          for (const account of new Set(
            requests.map(({ account }) => account),
          )) {
            const output = (await prepare(
              { account: { address: address(account) } } as never,
              { client: {} as never, phase: 'beforeFillTransaction' },
            )) as { nonceKey?: bigint | undefined }
            expect(output.nonceKey).toBeUndefined()
          }
        },
      ),
      fuzzParameters(250),
    )
  })
})
