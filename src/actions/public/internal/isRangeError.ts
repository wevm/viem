import { BaseError } from '../../../errors/base.js'
import { HttpRequestError, RpcRequestError } from '../../../errors/request.js'

/** Returns whether a failed `eth_getLogs` request may succeed with a smaller block range. */
export function isRangeError(error: unknown) {
  if (!(error instanceof BaseError)) return true
  const cause = error.walk(
    (err) => err instanceof HttpRequestError || err instanceof RpcRequestError,
  ) as HttpRequestError | RpcRequestError | null
  if (!cause) return true
  // Rate limited.
  if (cause instanceof RpcRequestError && cause.code === 429) return false
  // Unreachable.
  if (cause instanceof HttpRequestError && cause.status === undefined)
    return false
  // Unauthorized, forbidden or rate limited.
  return cause.status !== 401 && cause.status !== 403 && cause.status !== 429
}
