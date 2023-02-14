import {
  BaseError,
  HttpRequestError,
  InternalRpcError,
  InvalidInputRpcError,
  InvalidParamsRpcError,
  InvalidRequestRpcError,
  JsonRpcVersionUnsupportedError,
  LimitExceededRpcError,
  MethodNotFoundRpcError,
  MethodNotSupportedRpcError,
  ParseRpcError,
  ResourceNotFoundRpcError,
  ResourceUnavailableRpcError,
  RpcError,
  TransactionRejectedRpcError,
  UnknownRpcError,
} from '../errors'
import { withRetry } from './promise'

export const isDeterministicError = (error: Error) => {
  if (error instanceof UnknownRpcError) return false
  if ('code' in error) return error.code !== -32603 && error.code !== -32005
  if (error instanceof HttpRequestError && error.status)
    return (
      error.status !== 408 &&
      error.status !== 413 &&
      error.status !== 429 &&
      error.status !== 500
    )
  return true
}

export function buildRequest<TRequest extends (args: any) => Promise<any>>(
  request: TRequest,
  {
    retryDelay = 150,
    retryCount = 3,
  }: {
    // The base delay (in ms) between retries.
    retryDelay?: number
    // The max number of times to retry.
    retryCount?: number
  } = {},
) {
  return (async (args: any) =>
    withRetry(
      async () => {
        try {
          return await request(args)
        } catch (err_) {
          let err = err_ as unknown as RpcError
          if (err.code === -32700) throw new ParseRpcError(err)
          if (err.code === -32600) throw new InvalidRequestRpcError(err)
          if (err.code === -32601) throw new MethodNotFoundRpcError(err)
          if (err.code === -32602) throw new InvalidParamsRpcError(err)
          if (err.code === -32603) throw new InternalRpcError(err)
          if (err.code === -32000) throw new InvalidInputRpcError(err)
          if (err.code === -32001) throw new ResourceNotFoundRpcError(err)
          if (err.code === -32002) throw new ResourceUnavailableRpcError(err)
          if (err.code === -32003) throw new TransactionRejectedRpcError(err)
          if (err.code === -32004) throw new MethodNotSupportedRpcError(err)
          if (err.code === -32005) throw new LimitExceededRpcError(err)
          if (err.code === -32006) throw new JsonRpcVersionUnsupportedError(err)
          // TODO: 4001 - user rejected
          // TODO: 4902 - switch chain error
          if (err_ instanceof BaseError) throw err_
          throw new UnknownRpcError(err as Error)
        }
      },
      {
        delay: ({ count, error }) => {
          // If we find a Retry-After header, let's retry after the given time.
          if (error && error instanceof HttpRequestError) {
            const retryAfter = error?.headers?.get('Retry-After')
            if (retryAfter?.match(/\d/)) return parseInt(retryAfter) * 1000
          }

          // Otherwise, let's retry with an exponential backoff.
          return ~~(1 << count) * retryDelay
        },
        retryCount,
        shouldRetry: ({ error }) => !isDeterministicError(error),
      },
    )) as TRequest
}
