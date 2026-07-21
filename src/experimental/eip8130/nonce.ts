import { BaseError } from '../../errors/base.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { bytesToHex } from '../../utils/encoding/toHex.js'
import { nonceFreeMaxExpiryWindow, nonceKeyMax } from './constants.js'
import { isNoncelessOnly } from './keys.js'

/**
 * A resolved EIP-8130 nonce selection: the channel key and (for nonce-free
 * mode) the fixed sequence and required expiry. Spread the result directly into
 * {@link sendCalls8130} / {@link prepareTransaction8130} parameters.
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
   * Unix timestamp (seconds) after which the transaction is invalid. Required
   * for nonce-free mode (it is the sole replay protection there).
   */
  expiry?: bigint | undefined
}

/**
 * Builders for EIP-8130 nonce selection. EIP-8130 accounts support three
 * distinct nonce strategies; these helpers produce the correct
 * `nonceKey` / `nonceSequence` / `expiry` fields for each, ready to spread into
 * {@link sendCalls8130} / {@link prepareTransaction8130}.
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
 * import { nonce, sendCalls8130 } from 'viem/experimental/eip8130'
 *
 * // Two independent channels → can be mined in either order.
 * await sendCalls8130(client, { account, calls: a, gas, ...nonce.channel(1n) })
 * await sendCalls8130(client, { account, calls: b, gas, ...nonce.channel(2n) })
 *
 * // Fire-and-forget parallel txs on random channels.
 * await sendCalls8130(client, { account, calls, gas, ...nonce.randomChannel() })
 *
 * // Nonce-free: valid for the next 10 minutes, no sequencing.
 * await sendCalls8130(client, { account, calls, gas, ...nonce.nonceless({ expiresIn: 600 }) })
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
        '`NONCE_KEY_MAX` selects nonce-free mode, which has no counter. Use `nonce.nonceless({ expiry })` instead.',
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
   * @param parameters.expiry - Absolute expiry (unix seconds).
   * @param parameters.expiresIn - Relative expiry (seconds from now). Ignored
   *   when `expiry` is provided. One of `expiry` / `expiresIn` is required.
   */
  nonceless(parameters: { expiry?: bigint; expiresIn?: number }): Nonce {
    const { expiry, expiresIn } = parameters
    const resolvedExpiry =
      expiry ??
      (expiresIn !== undefined
        ? BigInt(Math.floor(Date.now() / 1000) + expiresIn)
        : undefined)
    if (resolvedExpiry === undefined || resolvedExpiry <= 0n)
      throw new BaseError(
        'Nonce-free mode requires a non-zero `expiry` (or `expiresIn`).',
      )
    return { nonceKey: nonceKeyMax, nonceSequence: 0n, expiry: resolvedExpiry }
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
   *   defaulting the expiry to `NONCE_FREE_MAX_EXPIRY_WINDOW` seconds from now.
   *
   * @param scope - The signing actor's scope bitmask.
   * @param parameters.key - Sequenced channel selector (ignored in nonce-free
   *   mode). @default 0n
   * @param parameters.expiry - Absolute expiry (unix seconds) for nonce-free
   *   mode. Overrides `expiresIn`.
   * @param parameters.expiresIn - Relative expiry (seconds) for nonce-free
   *   mode. @default Number(NONCE_FREE_MAX_EXPIRY_WINDOW)
   */
  forScope(
    scope: number,
    parameters: {
      key?: bigint | undefined
      expiry?: bigint | undefined
      expiresIn?: number | undefined
    } = {},
  ): Nonce {
    if (isNoncelessOnly(scope))
      return nonce.nonceless(
        parameters.expiry !== undefined
          ? { expiry: parameters.expiry }
          : {
              expiresIn:
                parameters.expiresIn ?? Number(nonceFreeMaxExpiryWindow),
            },
      )
    return nonce.channel(parameters.key ?? 0n)
  },
} as const
