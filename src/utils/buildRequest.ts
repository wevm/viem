import { BaseError } from '../errors/base.js'
import { HttpRequestError } from '../errors/request.js'
import {
  ChainDisconnectedError,
  InternalRpcError,
  InvalidInputRpcError,
  InvalidParamsRpcError,
  InvalidRequestRpcError,
  JsonRpcVersionUnsupportedError,
  LimitExceededRpcError,
  MethodNotFoundRpcError,
  MethodNotSupportedRpcError,
  ParseRpcError,
  ProviderDisconnectedError,
  ResourceNotFoundRpcError,
  ResourceUnavailableRpcError,
  type RpcError,
  SwitchChainError,
  TransactionRejectedRpcError,
  UnauthorizedProviderError,
  UnknownRpcError,
  UnsupportedProviderMethodError,
  UserRejectedRequestError,
} from '../errors/rpc.js'

import { withRetry } from './promise/withRetry.js'

export const isDeterministicError = (error: Error) => {
  if ('code' in error)
    return (
      error.code !== -1 &&
      error.code !== -32004 &&
      error.code !== -32005 &&
      error.code !== -32042 &&
      error.code !== -32603
    )
  if (error instanceof HttpRequestError && error.status)
    return (
      error.status !== 403 &&
      error.status !== 408 &&
      error.status !== 413 &&
      error.status !== 429 &&
      error.status !== 500 &&
      error.status !== 502 &&
      error.status !== 503 &&
      error.status !== 504
    )
  return false
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
          const err = err_ as unknown as RpcError
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
          if (err.code === -32042) throw new MethodNotSupportedRpcError(err)
          if (err.code === 4001) throw new UserRejectedRequestError(err)
          if (err.code === 4100) throw new UnauthorizedProviderError(err)
          if (err.code === 4200) throw new UnsupportedProviderMethodError(err)
          if (err.code === 4900) throw new ProviderDisconnectedError(err)
          if (err.code === 4901) throw new ChainDisconnectedError(err)
          if (err.code === 4902) throw new SwitchChainError(err)
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
