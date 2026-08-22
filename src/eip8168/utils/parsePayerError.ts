import { payerRejectedCode } from '../constants.js'
import type { PayerRejectedData } from '../types.js'

/**
 * Extracts the {@link PayerRejectedData} payload from a thrown payer error.
 *
 * A `payer_sendTransaction` / `payer_signTransaction` rejection surfaces as the
 * single `-32000` ({@link payerRejectedCode}) JSON-RPC envelope, with the
 * machine-readable condition and any actionable detail (`requote`,
 * `minGasLimit`, `gas`, `balance`) on `error.data`. viem wraps that response in
 * an `RpcRequestError` (carrying the numeric `code` and raw `data`) nested in
 * the thrown error's `cause` chain.
 *
 * Walks that chain and returns the first `data`-shaped payload whose `code` is a
 * string (the canonical condition name) — distinguishing it from the numeric
 * JSON-RPC envelope code. Returns `undefined` for non-payer errors so callers
 * can rethrow.
 *
 * @example
 * try {
 *   await payerClient.sendTransaction({ signedTransaction })
 * } catch (error) {
 *   const rejected = parsePayerError(error)
 *   if (rejected?.code === 'PAYMENT_INSUFFICIENT' && rejected.requote) {
 *     // re-sign phase 0 from `rejected.requote` and resubmit
 *   }
 * }
 */
export function parsePayerError(error: unknown): PayerRejectedData | undefined {
  const seen = new Set<unknown>()
  let current: unknown = error

  while (current && typeof current === 'object' && !seen.has(current)) {
    seen.add(current)

    const node = current as {
      code?: unknown
      data?: unknown
      cause?: unknown
    }

    // The JSON-RPC `error.data` rides on the carrier (e.g. `RpcRequestError`);
    // its `code` is the canonical string condition, vs. the numeric envelope.
    const data = node.data
    if (
      data &&
      typeof data === 'object' &&
      typeof (data as { code?: unknown }).code === 'string'
    )
      return data as PayerRejectedData

    // A directly-thrown payload (no viem wrapping) is itself the data.
    if (typeof node.code === 'string') return current as PayerRejectedData

    current = node.cause
  }

  return undefined
}

/** The numeric envelope every payer rejection rides on. Re-exported for routing. */
export { payerRejectedCode }
