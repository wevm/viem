import { BaseError } from '../errors/base.js'
import {
  HttpRequestError,
  type HttpRequestErrorType,
  type RpcRequestErrorType,
  type TimeoutErrorType,
  type WebSocketRequestErrorType,
} from '../errors/request.js'
import {
  ChainDisconnectedError,
  type ChainDisconnectedErrorType,
  InternalRpcError,
  type InternalRpcErrorType,
  InvalidInputRpcError,
  type InvalidInputRpcErrorType,
  InvalidParamsRpcError,
  type InvalidParamsRpcErrorType,
  InvalidRequestRpcError,
  type InvalidRequestRpcErrorType,
  JsonRpcVersionUnsupportedError,
  type JsonRpcVersionUnsupportedErrorType,
  LimitExceededRpcError,
  type LimitExceededRpcErrorType,
  MethodNotFoundRpcError,
  type MethodNotFoundRpcErrorType,
  MethodNotSupportedRpcError,
  type MethodNotSupportedRpcErrorType,
  ParseRpcError,
  type ParseRpcErrorType,
  ProviderDisconnectedError,
  type ProviderDisconnectedErrorType,
  type ProviderRpcErrorCode,
  ResourceNotFoundRpcError,
  type ResourceNotFoundRpcErrorType,
  ResourceUnavailableRpcError,
  type ResourceUnavailableRpcErrorType,
  type RpcError,
  type RpcErrorCode,
  type RpcErrorType,
  SwitchChainError,
  type SwitchChainErrorType,
  TransactionRejectedRpcError,
  type TransactionRejectedRpcErrorType,
  UnauthorizedProviderError,
  type UnauthorizedProviderErrorType,
  UnknownRpcError,
  type UnknownRpcErrorType,
  UnsupportedProviderMethodError,
  type UnsupportedProviderMethodErrorType,
  UserRejectedRequestError,
  type UserRejectedRequestErrorType,
} from '../errors/rpc.js'
import type { ErrorType } from '../errors/utils.js'
import type { CreateBatchSchedulerErrorType } from './promise/createBatchScheduler.js'
import { type WithRetryErrorType, withRetry } from './promise/withRetry.js'
import type { GetSocketErrorType } from './rpc.js'

export type IsDeterministicErrorType = ErrorType

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

export type RequestErrorType =
  | ChainDisconnectedErrorType
  | CreateBatchSchedulerErrorType
  | HttpRequestErrorType
  | InternalRpcErrorType
  | InvalidInputRpcErrorType
  | InvalidParamsRpcErrorType
  | InvalidRequestRpcErrorType
  | GetSocketErrorType
  | JsonRpcVersionUnsupportedErrorType
  | LimitExceededRpcErrorType
  | MethodNotFoundRpcErrorType
  | MethodNotSupportedRpcErrorType
  | ParseRpcErrorType
  | ProviderDisconnectedErrorType
  | ResourceNotFoundRpcErrorType
  | ResourceUnavailableRpcErrorType
  | RpcErrorType
  | RpcRequestErrorType
  | SwitchChainErrorType
  | TimeoutErrorType
  | TransactionRejectedRpcErrorType
  | UnauthorizedProviderErrorType
  | UnknownRpcErrorType
  | UnsupportedProviderMethodErrorType
  | UserRejectedRequestErrorType
  | WebSocketRequestErrorType
  | WithRetryErrorType
  | ErrorType

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
          const err = err_ as unknown as RpcError<
            RpcErrorCode | ProviderRpcErrorCode
          >
          switch (err.code) {
            // -32700
            case ParseRpcError.code:
              throw new ParseRpcError(err)
            // -32600
            case InvalidRequestRpcError.code:
              throw new InvalidRequestRpcError(err)
            // -32601
            case MethodNotFoundRpcError.code:
              throw new MethodNotFoundRpcError(err)
            // -32602
            case InvalidParamsRpcError.code:
              throw new InvalidParamsRpcError(err)
            // -32603
            case InternalRpcError.code:
              throw new InternalRpcError(err)
            // -32000
            case InvalidInputRpcError.code:
              throw new InvalidInputRpcError(err)
            // -32001
            case ResourceNotFoundRpcError.code:
              throw new ResourceNotFoundRpcError(err)
            // -32002
            case ResourceUnavailableRpcError.code:
              throw new ResourceUnavailableRpcError(err)
            // -32003
            case TransactionRejectedRpcError.code:
              throw new TransactionRejectedRpcError(err)
            // -32004
            case MethodNotSupportedRpcError.code:
              throw new MethodNotSupportedRpcError(err)
            // -32005
            case LimitExceededRpcError.code:
              throw new LimitExceededRpcError(err)
            // -32006
            case JsonRpcVersionUnsupportedError.code:
              throw new JsonRpcVersionUnsupportedError(err)
            // 4001
            case UserRejectedRequestError.code:
              throw new UserRejectedRequestError(err)
            // 4100
            case UnauthorizedProviderError.code:
              throw new UnauthorizedProviderError(err)
            // 4200
            case UnsupportedProviderMethodError.code:
              throw new UnsupportedProviderMethodError(err)
            // 4900
            case ProviderDisconnectedError.code:
              throw new ProviderDisconnectedError(err)
            // 4901
            case ChainDisconnectedError.code:
              throw new ChainDisconnectedError(err)
            // 4902
            case SwitchChainError.code:
              throw new SwitchChainError(err)
            // CAIP-25: User Rejected Error
            // https://docs.walletconnect.com/2.0/specs/clients/sign/error-codes#rejected-caip-25
            case 5000:
              throw new UserRejectedRequestError(err)
            default:
              if (err_ instanceof BaseError) throw err_
              throw new UnknownRpcError(err as Error)
          }
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
