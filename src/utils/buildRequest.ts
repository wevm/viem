import {
  BaseError,
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

export const isNonDeterministicError = (error: Error) => {
  if (error instanceof UnknownRpcError) return true
  if ('code' in error)
    return (
      error.code === -32603 || error.code === -32000 || error.code === -32005
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
        delay: ({ count }) => ~~(1 << count) * retryDelay,
        retryCount,
        shouldRetryOnError: ({ error }) => isNonDeterministicError(error),
      },
    )) as TRequest
}
