import * as Hex from 'ox/Hex'
import { BaseError } from '../errors/base.js'
import * as Frame from './Frame.js'
import * as internal from './internal/transaction.js'

/**
 * Requires execution on or before an absolute or relative deadline.
 *
 * - Docs: https://viem.sh/docs/frames/expiry
 *
 * @example
 * ```ts
 * import { calls, expiry } from 'viem/frames'
 *
 * frames: [expiry(1_800_000_000), calls([{ to, value: 1n }])]
 * ```
 *
 * @param deadline - A Unix timestamp in seconds, ISO date string, or duration relative to the current time.
 * @returns An expiry verifier that must be the first frame.
 */
export function expiry(
  deadline:
    | number
    | bigint
    | `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`
    | (string & {}),
) {
  if (typeof deadline === 'string') {
    const match = /^(\d+(?:\.\d+)?)(s|m|h|d|w|y)$/.exec(deadline)
    if (match && match[2] === 'y') {
      const months = Number(match[1]!) * 12
      if (
        !Number.isSafeInteger(Number(match[1]!)) ||
        !Number.isSafeInteger(months)
      )
        throw new BaseError(
          'Frame.expiry: a year duration must contain a safe integer number of years and resolve to a safe integer number of months.',
        )

      const date = new Date()
      const day = date.getUTCDate()
      date.setUTCDate(1)
      date.setUTCMonth(date.getUTCMonth() + months)

      const end = new Date(date)
      end.setUTCMonth(end.getUTCMonth() + 1, 0)
      date.setUTCDate(Math.min(day, end.getUTCDate()))
      deadline = Math.floor(date.getTime() / 1000)
    } else if (match) {
      const units = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 }
      const seconds = Number(match[1]!) * units[match[2]! as keyof typeof units]
      if (!Number.isSafeInteger(seconds))
        throw new BaseError(
          'Frame.expiry: duration must resolve to a safe integer number of seconds.',
        )

      deadline = Math.floor(Date.now() / 1000) + seconds
    } else {
      if (
        !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(
          deadline,
        )
      )
        throw new BaseError(
          'Frame.expiry: `deadline` must be a duration or ISO date; date-time strings must include a UTC offset or "Z".',
        )

      const timestamp = Date.parse(deadline)
      if (!Number.isFinite(timestamp))
        throw new BaseError(
          'Frame.expiry: `deadline` cannot be parsed as a finite ISO date timestamp.',
        )

      deadline = Math.floor(timestamp / 1000)
    }
  }

  if (typeof deadline === 'number' && !Number.isSafeInteger(deadline))
    throw new BaseError(
      'Frame.expiry: numeric `deadline` must be a safe integer Unix timestamp in seconds, or a bigint timestamp.',
    )

  return Frame.from(() => ({
    frame: {
      data: Hex.fromNumber(deadline, { size: 8 }),
      flags: 'none',
      mode: 'verify',
      stateGas: 0n,
      to: internal.expiryVerifier,
    },
  }))
}
