import fc from 'fast-check'
import { Hex, Secp256k1 } from 'ox'
import { TxEnvelopeTempo } from 'ox/tempo'
import { maxUint256, zeroAddress } from 'viem'
import { Relay } from 'viem/tempo'
import { expect, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'
import { fuzzParameters } from '~test/tempo/fuzz.js'
import type * as Request from './request.js'
import * as Utils from './utils.js'

const sender = Tempo.accounts[9]!
const sponsor = Tempo.accounts[0]!
const tokens = {
  configured: '0x20c0000000000000000000000000000000000002',
  requested: Tempo.addresses.alphaUsd,
  resolved: Tempo.addresses.pathUsd,
} as const

const fill = fc.record({
  configured: fc.boolean(),
  nonce: fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
  nonceKey: fc.oneof(
    fc.constant(0n),
    fc.bigInt({ min: 1n, max: 2n ** 64n }),
    fc.constant(maxUint256),
  ),
  requested: fc.boolean(),
  validAfter: fc.option(fc.integer({ min: -100, max: 8_000 }), {
    nil: undefined,
  }),
  validBefore: fc.option(fc.integer({ min: -100, max: 8_000 }), {
    nil: undefined,
  }),
  validity: fc.option(fc.integer({ min: 1, max: 7_200 }), { nil: undefined }),
})

test('signs a fill only within the validity limit of its nonce lane', async () => {
  await fc.assert(
    fc.asyncProperty(fill, async (input) => {
      const now = Math.floor(Date.now() / 1000)
      const validity = input.validity ?? 3_600
      const limit =
        input.nonceKey === maxUint256 ? Math.min(validity, 300) : validity
      // Generated expiring windows leave 30 seconds of headroom for clock skew.
      const generated =
        input.nonceKey === maxUint256 ? Math.min(limit, 270) : limit
      const step = Math.min(300, Math.ceil(generated / 10))
      const validAfter =
        input.validAfter === undefined ? undefined : now + input.validAfter
      const validBefore =
        input.validBefore === undefined ? undefined : now + input.validBefore

      // Values within a few seconds of a bound depend on the clock tick.
      const near = (value: number | undefined, bound: number) =>
        value !== undefined && Math.abs(value - bound) <= 2
      fc.pre(!near(validBefore, now) && !near(validBefore, now + limit))
      fc.pre(!near(validAfter, validBefore ?? now + generated))
      fc.pre(
        validBefore !== undefined ||
          validAfter === undefined ||
          validAfter < now + generated - step - 2 ||
          validAfter > now + generated + 2,
      )

      const relay = Relay.create({
        client: Tempo.getClient({ chain: Tempo.chain }),
        resolveTokens: () => [tokens.resolved],
        plugins: [
          Relay.feePayer({
            account: sponsor,
            ...(input.configured ? { feeToken: tokens.configured } : {}),
            ...(input.validity !== undefined
              ? { validity: input.validity }
              : {}),
          }),
        ],
      })
      const request = relay.request({
        method: 'eth_fillTransaction',
        params: [
          {
            calls: [{ to: zeroAddress }],
            chainId: Hex.fromNumber(Tempo.chain.id),
            feePayer: true,
            from: sender.address,
            gas: '0x100000',
            maxFeePerGas: '0x4a817c800',
            nonce: Hex.fromNumber(input.nonce),
            nonceKey: Hex.fromNumber(input.nonceKey),
            ...(input.requested ? { feeToken: tokens.requested } : {}),
            ...(validAfter !== undefined
              ? { validAfter: Hex.fromNumber(validAfter) }
              : {}),
            ...(validBefore !== undefined
              ? { validBefore: Hex.fromNumber(validBefore) }
              : {}),
          },
        ],
      }) as Promise<Request.Result>

      const bound = validBefore ?? now + generated
      const accepted =
        (validBefore === undefined ||
          (validBefore > now && validBefore <= now + limit)) &&
        (validAfter === undefined || validAfter < bound)
      if (!accepted) {
        await expect(request).rejects.toThrow(
          `Sponsored transactions require a \`validBefore\` within ${limit} seconds.`,
        )
        return
      }

      const transaction = Utils.normalizeTempoTransaction((await request).tx)
      const envelope = TxEnvelopeTempo.from(
        transaction as TxEnvelopeTempo.TxEnvelopeTempo,
      )

      if (validBefore !== undefined)
        expect(envelope.validBefore).toBe(validBefore)
      else {
        expect(envelope.validBefore).toBeGreaterThan(now + generated - step - 1)
        expect(envelope.validBefore).toBeLessThanOrEqual(now + generated + 1)
      }
      expect(envelope.validAfter).toBe(validAfter)
      expect(envelope.nonce).toBe(BigInt(input.nonce))
      expect(envelope.nonceKey).toBe(input.nonceKey)
      expect(envelope.gas).toBe(0x100000n)
      expect(String(envelope.feeToken).toLowerCase()).toBe(
        (() => {
          if (input.configured) return tokens.configured
          if (input.requested) return tokens.requested
          return tokens.resolved
        })().toLowerCase(),
      )
      expect(
        Secp256k1.recoverAddress({
          payload: TxEnvelopeTempo.getFeePayerSignPayload(envelope, {
            sender: sender.address,
          }),
          signature: envelope.feePayerSignature!,
        }),
      ).toBe(sponsor.address.toLowerCase())
    }),
    fuzzParameters(100),
  )
})
