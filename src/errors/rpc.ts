import { BaseError } from './base.js'
import { RpcRequestError } from './request.js'

const unknownErrorCode = -1

type RpcErrorOptions = {
  code?: number
  docsPath?: string
  metaMessages?: string[]
  shortMessage: string
}

/**
 * Error subclass implementing JSON RPC 2.0 errors and Ethereum RPC errors per EIP-1474.
 *
 * - EIP https://eips.ethereum.org/EIPS/eip-1474
 */
export class RpcError extends BaseError {
  code: number

  constructor(
    cause: Error,
    {
      code = unknownErrorCode,
      docsPath,
      metaMessages,
      shortMessage,
    }: RpcErrorOptions,
  ) {
    super(shortMessage, {
      cause,
      docsPath,
      metaMessages:
        metaMessages || (cause as { metaMessages?: string[] })?.metaMessages,
    })
    this.name = cause.name
    this.code = cause instanceof RpcRequestError ? cause.code : code
  }
}

/**
 * Error subclass implementing Ethereum Provider errors per EIP-1193.
 *
 * - EIP https://eips.ethereum.org/EIPS/eip-1193
 */
export class ProviderRpcError<T = undefined> extends RpcError {
  override name = 'ProviderRpcError'

  data?: T

  constructor(
    cause: Error,
    options: RpcErrorOptions & {
      data?: T
    },
  ) {
    super(cause, options)

    this.data = options.data
  }
}

/**
 * Subclass for a "Parse error" EIP-1474 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export class ParseRpcError extends RpcError {
  override name = 'ParseRpcError'

  constructor(cause: Error) {
    super(cause, {
      code: -32700,
      shortMessage:
        'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
    })
  }
}

/**
 * Subclass for a "Invalid request" EIP-1474 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export class InvalidRequestRpcError extends RpcError {
  override name = 'InvalidRequestRpcError'

  constructor(cause: Error) {
    super(cause, {
      code: -32600,
      shortMessage: 'JSON is not a valid request object.',
    })
  }
}

/**
 * Subclass for a "Method not found" EIP-1474 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export class MethodNotFoundRpcError extends RpcError {
  override name = 'MethodNotFoundRpcError'

  constructor(cause: Error) {
    super(cause, {
      code: -32601,
      shortMessage: 'The method does not exist / is not available.',
    })
  }
}

/**
 * Subclass for an "Invalid params" EIP-1474 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export class InvalidParamsRpcError extends RpcError {
  override name = 'InvalidParamsRpcError'

  constructor(cause: Error) {
    super(cause, {
      code: -32602,
      shortMessage: [
        'Invalid parameters were provided to the RPC method.',
        'Double check you have provided the correct parameters.',
      ].join('\n'),
    })
  }
}

/**
 * Subclass for an "Internal error" EIP-1474 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export class InternalRpcError extends RpcError {
  override name = 'InternalRpcError'

  constructor(cause: Error) {
    super(cause, {
      code: -32603,
      shortMessage: 'An internal error was received.',
    })
  }
}

/**
 * Subclass for an "Invalid input" EIP-1474 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export class InvalidInputRpcError extends RpcError {
  override name = 'InvalidInputRpcError'

  constructor(cause: Error) {
    super(cause, {
      code: -32000,
      shortMessage: [
        'Missing or invalid parameters.',
        'Double check you have provided the correct parameters.',
      ].join('\n'),
    })
  }
}

/**
 * Subclass for a "Resource not found" EIP-1474 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export class ResourceNotFoundRpcError extends RpcError {
  override name = 'ResourceNotFoundRpcError'

  constructor(cause: Error) {
    super(cause, {
      code: -32001,
      shortMessage: 'Requested resource not found.',
    })
  }
}

/**
 * Subclass for a "Resource unavailable" EIP-1474 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export class ResourceUnavailableRpcError extends RpcError {
  override name = 'ResourceUnavailableRpcError'

  constructor(cause: Error) {
    super(cause, {
      code: -32002,
      shortMessage: 'Requested resource not available.',
    })
  }
}

/**
 * Subclass for a "Transaction rejected" EIP-1474 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export class TransactionRejectedRpcError extends RpcError {
  override name = 'TransactionRejectedRpcError'

  constructor(cause: Error) {
    super(cause, { code: -32003, shortMessage: 'Transaction creation failed.' })
  }
}

/**
 * Subclass for a "Method not supported" EIP-1474 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export class MethodNotSupportedRpcError extends RpcError {
  override name = 'MethodNotSupportedRpcError'

  constructor(cause: Error) {
    super(cause, { code: -32004, shortMessage: 'Method is not implemented.' })
  }
}

/**
 * Subclass for a "Limit exceeded" EIP-1474 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export class LimitExceededRpcError extends RpcError {
  override name = 'LimitExceededRpcError'

  constructor(cause: Error) {
    super(cause, {
      code: -32005,
      shortMessage: 'Request exceeds defined limit.',
    })
  }
}

/**
 * Subclass for a "JSON-RPC version not supported" EIP-1474 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export class JsonRpcVersionUnsupportedError extends RpcError {
  override name = 'JsonRpcVersionUnsupportedError'

  constructor(cause: Error) {
    super(cause, {
      code: -32006,
      shortMessage: 'Version of JSON-RPC protocol is not supported.',
    })
  }
}

/**
 * Subclass for a "User Rejected Request" EIP-1193 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export class UserRejectedRequestError extends ProviderRpcError {
  override name = 'UserRejectedRequestError'

  constructor(cause: Error) {
    super(cause, {
      code: 4001,
      shortMessage: 'User rejected the request.',
    })
  }
}

/**
 * Subclass for an "Unauthorized" EIP-1193 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export class UnauthorizedProviderError extends ProviderRpcError {
  override name = 'UnauthorizedProviderError'

  constructor(cause: Error) {
    super(cause, {
      code: 4100,
      shortMessage:
        'The requested method and/or account has not been authorized by the user.',
    })
  }
}

/**
 * Subclass for an "Unsupported Method" EIP-1193 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export class UnsupportedProviderMethodError extends ProviderRpcError {
  override name = 'UnsupportedProviderMethodError'

  constructor(cause: Error) {
    super(cause, {
      code: 4200,
      shortMessage: 'The Provider does not support the requested method.',
    })
  }
}

/**
 * Subclass for an "Disconnected" EIP-1193 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export class ProviderDisconnectedError extends ProviderRpcError {
  override name = 'ProviderDisconnectedError'

  constructor(cause: Error) {
    super(cause, {
      code: 4900,
      shortMessage: 'The Provider is disconnected from all chains.',
    })
  }
}

/**
 * Subclass for an "Chain Disconnected" EIP-1193 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export class ChainDisconnectedError extends ProviderRpcError {
  override name = 'ChainDisconnectedError'

  constructor(cause: Error) {
    super(cause, {
      code: 4901,
      shortMessage: 'The Provider is not connected to the requested chain.',
    })
  }
}

/**
 * Subclass for an "Switch Chain" EIP-1193 error.
 *
 * EIP https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export class SwitchChainError extends ProviderRpcError {
  override name = 'SwitchChainError'

  constructor(cause: Error) {
    super(cause, {
      code: 4902,
      shortMessage: 'An error occurred when attempting to switch chain.',
    })
  }
}

/**
 * Subclass for an unknown RPC error.
 */
export class UnknownRpcError extends RpcError {
  override name = 'UnknownRpcError'

  constructor(cause: Error) {
    super(cause, {
      shortMessage: 'An unknown RPC error occurred.',
    })
  }
}
