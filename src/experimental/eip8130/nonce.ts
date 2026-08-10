import { BaseError } from '../../errors/base.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { bytesToHex } from '../../utils/encoding/toHex.js'
import { nonceFreeMaxExpiryWindow, nonceKeyMax } from './constants.js'
import { isNoncelessOnly } from './keys.js'

/**
 * A resolved EIP-8130 nonce selection: the channel key and (for nonce-free
 * mode) the fixed sequence and required expiry. Spread the result directly into
 * {@link sendCalls} / {@link prepareTransaction} parameters.
 */
export type Nonce = {
  /** 2D nonce channel selector (`uint256`). `0` = standard sequential ordering. */
  nonceKey: bigint
  /**
   * Expected sequence within the channel. Omitted for counter-backed channels
   * (read from the node); pinned to `0n` for nonce-free mode.
   */
  nonceSequence?: bigint | undefined
  /**
   * Unix timestamp (**milliseconds**) at/after which the transaction is invalid
   * (the tx `validBefore`). Required (non-zero) for nonce-free mode — it is the
   * sole replay protection there.
   */
  validBefore?: bigint | undefined
}

/**
 * Builders for EIP-8130 nonce selection. EIP-8130 accounts support three
 * distinct nonce strategies; these helpers produce the correct
 * `nonceKey` / `nonceSequence` / `expiry` fields for each, ready to spread into
 * {@link sendCalls} / {@link prepareTransaction}.
 *
 * - {@link nonce.sequential} — the classic single-file nonce (channel `0`).
 * - {@link nonce.channel} / {@link nonce.randomChannel} — independent 2D nonce
 *   channels, each with its own counter, so transactions in different channels
 *   can be submitted and mined in parallel / out of order (high throughput).
 * - {@link nonce.nonceless} — nonce-free (expiring) mode: no counter is read or
 *   incremented; replay protection relies entirely on `expiry`.
 *
 * @example
 * ```ts
 * import { nonce, sendCalls } from 'viem/experimental/eip8130'
 *
 * // Two independent channels → can be mined in either order.
 * await sendCalls(client, { account, calls: a, gas, ...nonce.channel(1n) })
 * await sendCalls(client, { account, calls: b, gas, ...nonce.channel(2n) })
 *
 * // Fire-and-forget parallel txs on random channels.
 * await sendCalls(client, { account, calls, gas, ...nonce.randomChannel() })
 *
 * // Nonce-free: valid for the next 10 minutes, no sequencing.
 * await sendCalls(client, { account, calls, gas, ...nonce.nonceless({ expiresIn: 600 }) })
 * ```
 */
export const nonce = {
  /**
   * Standard sequential nonce (channel `0`). The node reads and increments the
   * account's protocol nonce; transactions are strictly ordered.
   */
  sequential(): Nonce {
    return { nonceKey: 0n }
  },

  /**
   * A specific 2D nonce channel. Each channel maintains its own sequential
   * counter, so transactions in different channels are independent and may be
   * mined out of order relative to one another. The next sequence for the
   * channel is read from the node when not supplied.
   *
   * @param key - Channel selector (`1 … NONCE_KEY_MAX - 1`). `0` is the standard
   *   channel (use {@link nonce.sequential}); `NONCE_KEY_MAX` is reserved for
   *   nonce-free mode (use {@link nonce.nonceless}).
   */
  channel(key: bigint): Nonce {
    if (key < 0n || key > nonceKeyMax)
      throw new BaseError(
        `\`nonceKey\` must be in \`0 … NONCE_KEY_MAX\`. Received ${key}.`,
      )
    if (key === nonceKeyMax)
      throw new BaseError(
        '`NONCE_KEY_MAX` selects nonce-free mode, which has no counter. Use `nonce.nonceless({ validBefore })` instead.',
      )
    return { nonceKey: key }
  },

  /**
   * A pseudo-random 2D nonce channel (uniform in `1 … NONCE_KEY_MAX - 1`). Use
   * for fire-and-forget parallel transactions where ordering between them does
   * not matter and a fresh, collision-free channel is desired per send.
   */
  randomChannel(): Nonce {
    const buffer = new Uint8Array(32)
    globalThis.crypto.getRandomValues(buffer)
    // Map uniformly into `1 … NONCE_KEY_MAX - 1` (never `0` or `NONCE_KEY_MAX`).
    const key = (hexToBigInt(bytesToHex(buffer)) % (nonceKeyMax - 1n)) + 1n
    return { nonceKey: key }
  },

  /**
   * Nonce-free (expiring) mode (`nonceKey = NONCE_KEY_MAX`). No per-account
   * counter is read or incremented, so the transaction is not ordered against
   * any other; replay protection is provided solely by `expiry`. Ideal for
   * fully parallel, retry-safe sends.
   *
   * @param parameters.validBefore - Absolute upper validity bound (unix ms).
   * @param parameters.expiresIn - Relative validity window (**seconds** from
   *   now). Ignored when `validBefore` is provided. One of `validBefore` /
   *   `expiresIn` is required.
   */
  nonceless(parameters: { validBefore?: bigint; expiresIn?: number }): Nonce {
    const { validBefore, expiresIn } = parameters
    // `validBefore` is unix milliseconds; `expiresIn` is a seconds duration.
    const resolvedValidBefore =
      validBefore ??
      (expiresIn !== undefined
        ? BigInt(Date.now() + expiresIn * 1000)
        : undefined)
    if (resolvedValidBefore === undefined || resolvedValidBefore <= 0n)
      throw new BaseError(
        'Nonce-free mode requires a non-zero `validBefore` (or `expiresIn`).',
      )
    return {
      nonceKey: nonceKeyMax,
      nonceSequence: 0n,
      validBefore: resolvedValidBefore,
    }
  },

  /**
   * Selects the default nonce strategy for an actor's `scope`, mirroring the
   * node rule. Admin actors (`scope == 0`) and actors holding `SCOPE_NONCE` may
   * use ordered *or* nonce-free nonces; only a restricted actor **without**
   * `SCOPE_NONCE` is confined to nonce-free.
   *
   * - Admin (`scope == 0`) **or** `SCOPE_NONCE` set → sequenced
   *   {@link nonce.channel} (default channel `0`, i.e. {@link nonce.sequential}).
   * - Restricted actor **without** `SCOPE_NONCE` → {@link nonce.nonceless},
   *   defaulting the window to `NONCE_FREE_MAX_EXPIRY_WINDOW` from now.
   *
   * @param scope - The signing actor's scope bitmask.
   * @param parameters.key - Sequenced channel selector (ignored in nonce-free
   *   mode). @default 0n
   * @param parameters.validBefore - Absolute upper validity bound (unix ms) for
   *   nonce-free mode. Overrides `expiresIn`.
   * @param parameters.expiresIn - Relative validity window (seconds) for
   *   nonce-free mode. @default Number(NONCE_FREE_MAX_EXPIRY_WINDOW) / 1000
   */
  forScope(
    scope: number,
    parameters: {
      key?: bigint | undefined
      validBefore?: bigint | undefined
      expiresIn?: number | undefined
    } = {},
  ): Nonce {
    if (isNoncelessOnly(scope))
      return nonce.nonceless(
        parameters.validBefore !== undefined
          ? { validBefore: parameters.validBefore }
          : {
              // `nonceFreeMaxExpiryWindow` is milliseconds; `expiresIn` seconds.
              expiresIn:
                parameters.expiresIn ?? Number(nonceFreeMaxExpiryWindow) / 1000,
            },
      )
    return nonce.channel(parameters.key ?? 0n)
  },
} as const
