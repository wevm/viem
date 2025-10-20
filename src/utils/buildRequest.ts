import { BaseError } from '../errors/base.js'
import {
  HttpRequestError,
  type HttpRequestErrorType,
  type RpcRequestErrorType,
  type TimeoutErrorType,
  type WebSocketRequestErrorType,
} from '../errors/request.js'
import {
  AtomicityNotSupportedError,
  type AtomicityNotSupportedErrorType,
  AtomicReadyWalletRejectedUpgradeError,
  type AtomicReadyWalletRejectedUpgradeErrorType,
  BundleTooLargeError,
  type BundleTooLargeErrorType,
  ChainDisconnectedError,
  type ChainDisconnectedErrorType,
  DuplicateIdError,
  type DuplicateIdErrorType,
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
  UnknownBundleIdError,
  type UnknownBundleIdErrorType,
  UnknownRpcError,
  type UnknownRpcErrorType,
  UnsupportedChainIdError,
  type UnsupportedChainIdErrorType,
  UnsupportedNonOptionalCapabilityError,
  type UnsupportedNonOptionalCapabilityErrorType,
  UnsupportedProviderMethodError,
  type UnsupportedProviderMethodErrorType,
  UserRejectedRequestError,
  type UserRejectedRequestErrorType,
} from '../errors/rpc.js'
import type { ErrorType } from '../errors/utils.js'
import type {
  EIP1193RequestFn,
  EIP1193RequestOptions,
} from '../types/eip1193.js'
import { stringToHex } from './encoding/toHex.js'
import type { CreateBatchSchedulerErrorType } from './promise/createBatchScheduler.js'
import { withDedupe } from './promise/withDedupe.js'
import { type WithRetryErrorType, withRetry } from './promise/withRetry.js'
import type { GetSocketRpcClientErrorType } from './rpc/socket.js'
import { stringify } from './stringify.js'

export type RequestErrorType =
  | AtomicityNotSupportedErrorType
  | AtomicReadyWalletRejectedUpgradeErrorType
  | BundleTooLargeErrorType
  | ChainDisconnectedErrorType
  | CreateBatchSchedulerErrorType
  | DuplicateIdErrorType
  | HttpRequestErrorType
  | InternalRpcErrorType
  | InvalidInputRpcErrorType
  | InvalidParamsRpcErrorType
  | InvalidRequestRpcErrorType
  | GetSocketRpcClientErrorType
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
  | UnknownBundleIdErrorType
  | UnknownRpcErrorType
  | UnsupportedChainIdErrorType
  | UnsupportedNonOptionalCapabilityErrorType
  | UnsupportedProviderMethodErrorType
  | UserRejectedRequestErrorType
  | WebSocketRequestErrorType
  | WithRetryErrorType
  | ErrorType

export function buildRequest<request extends (args: any) => Promise<any>>(
  request: request,
  options: EIP1193RequestOptions = {},
): EIP1193RequestFn {
  return async (args, overrideOptions = {}) => {
    const {
      dedupe = false,
      methods,
      retryDelay = 150,
      retryCount = 3,
      uid,
    } = {
      ...options,
      ...overrideOptions,
    }

    const { method } = args
    if (methods?.exclude?.includes(method))
      throw new MethodNotSupportedRpcError(new Error('method not supported'), {
        method,
      })
    if (methods?.include && !methods.include.includes(method))
      throw new MethodNotSupportedRpcError(new Error('method not supported'), {
        method,
      })

    const requestId = dedupe
      ? stringToHex(`${uid}.${stringify(args)}`)
      : undefined
    return withDedupe(
      () =>
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
                  throw new MethodNotFoundRpcError(err, { method: args.method })
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
                  throw new MethodNotSupportedRpcError(err, {
                    method: args.method,
                  })
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

                // 5700
                case UnsupportedNonOptionalCapabilityError.code:
                  throw new UnsupportedNonOptionalCapabilityError(err)
                // 5710
                case UnsupportedChainIdError.code:
                  throw new UnsupportedChainIdError(err)
                // 5720
                case DuplicateIdError.code:
                  throw new DuplicateIdError(err)
                // 5730
                case UnknownBundleIdError.code:
                  throw new UnknownBundleIdError(err)
                // 5740
                case BundleTooLargeError.code:
                  throw new BundleTooLargeError(err)
                // 5750
                case AtomicReadyWalletRejectedUpgradeError.code:
                  throw new AtomicReadyWalletRejectedUpgradeError(err)
                // 5760
                case AtomicityNotSupportedError.code:
                  throw new AtomicityNotSupportedError(err)

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
                if (retryAfter?.match(/\d/))
                  return Number.parseInt(retryAfter, 10) * 1000
              }

              // Otherwise, let's retry with an exponential backoff.
              return ~~(1 << count) * retryDelay
            },
            retryCount,
            shouldRetry: ({ error }) => shouldRetry(error),
          },
        ),
      { enabled: dedupe, id: requestId },
    )
  }
}

/** @internal */
export function shouldRetry(error: Error) {
  if ('code' in error && typeof error.code === 'number') {
    if (error.code === -1) return true // Unknown error
    if (error.code === LimitExceededRpcError.code) return true
    if (error.code === InternalRpcError.code) return true
    return false
  }
  if (error instanceof HttpRequestError && error.status) {
    // Forbidden
    if (error.status === 403) return true
    // Request Timeout
    if (error.status === 408) return true
    // Request Entity Too Large
    if (error.status === 413) return true
    // Too Many Requests
    if (error.status === 429) return true
    // Internal Server Error
    if (error.status === 500) return true
    // Bad Gateway
    if (error.status === 502) return true
    // Service Unavailable
    if (error.status === 503) return true
    // Gateway Timeout
    if (error.status === 504) return true
    return false
  }
  return true
}
