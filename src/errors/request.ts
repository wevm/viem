import { BaseError } from './base.js'
import type { RpcError } from './rpc.js'

export class RequestError extends BaseError {
  constructor(
    err: Error,
    {
      docsPath,
      metaMessages,
      shortMessage,
    }: { docsPath?: string; metaMessages?: string[]; shortMessage: string },
  ) {
    super(shortMessage, {
      cause: err,
      docsPath,
      metaMessages:
        metaMessages || (err as { metaMessages?: string[] })?.metaMessages,
    })
    this.name = err.name
  }
}

export class RpcRequestError extends RequestError {
  code: number

  constructor(
    err: RpcError,
    { docsPath, shortMessage }: { docsPath?: string; shortMessage: string },
  ) {
    super(err, { docsPath, shortMessage })
    this.code = err.code
    this.name = err.name
  }
}

export class ParseRpcError extends RpcRequestError {
  override name = 'ParseRpcError'
  override code = -32700

  constructor(err: RpcError) {
    super(err, {
      shortMessage:
        'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
    })
  }
}

export class InvalidRequestRpcError extends RpcRequestError {
  override name = 'InvalidRequestRpcError'
  override code = -32600

  constructor(err: RpcError) {
    super(err, { shortMessage: 'JSON is not a valid request object.' })
  }
}

export class MethodNotFoundRpcError extends RpcRequestError {
  override name = 'MethodNotFoundRpcError'
  override code = -32601

  constructor(err: RpcError) {
    super(err, {
      shortMessage: 'The method does not exist / is not available.',
    })
  }
}

export class InvalidParamsRpcError extends RpcRequestError {
  override name = 'InvalidParamsRpcError'
  override code = -32602

  constructor(err: RpcError) {
    super(err, {
      shortMessage: [
        'Invalid parameters were provided to the RPC method.',
        'Double check you have provided the correct parameters.',
      ].join('\n'),
    })
  }
}

export class InternalRpcError extends RpcRequestError {
  override name = 'InternalRpcError'
  override code = -32603

  constructor(err: RpcError) {
    super(err, { shortMessage: 'An internal error was received.' })
  }
}

export class InvalidInputRpcError extends RpcRequestError {
  override name = 'InvalidInputRpcError'
  override code = -32000

  constructor(err: RpcError) {
    super(err, {
      shortMessage: [
        'Missing or invalid parameters.',
        'Double check you have provided the correct parameters.',
      ].join('\n'),
    })
  }
}

export class ResourceNotFoundRpcError extends RpcRequestError {
  override name = 'ResourceNotFoundRpcError'
  override code = -32001

  constructor(err: RpcError) {
    super(err, { shortMessage: 'Requested resource not found.' })
  }
}

export class ResourceUnavailableRpcError extends RpcRequestError {
  override name = 'ResourceUnavailableRpcError'
  override code = -32002

  constructor(err: RpcError) {
    super(err, { shortMessage: 'Requested resource not available.' })
  }
}

export class TransactionRejectedRpcError extends RpcRequestError {
  override name = 'TransactionRejectedRpcError'
  override code = -32003

  constructor(err: RpcError) {
    super(err, { shortMessage: 'Transaction creation failed.' })
  }
}

export class MethodNotSupportedRpcError extends RpcRequestError {
  override name = 'MethodNotSupportedRpcError'
  override code = -32004

  constructor(err: RpcError) {
    super(err, { shortMessage: 'Method is not implemented.' })
  }
}

export class LimitExceededRpcError extends RpcRequestError {
  override name = 'LimitExceededRpcError'
  override code = -32005

  constructor(err: RpcError) {
    super(err, { shortMessage: 'Request exceeds defined limit.' })
  }
}

export class JsonRpcVersionUnsupportedError extends RpcRequestError {
  override name = 'JsonRpcVersionUnsupportedError'
  override code = -32006

  constructor(err: RpcError) {
    super(err, {
      shortMessage: 'Version of JSON-RPC protocol is not supported.',
    })
  }
}

export class UserRejectedRequestError extends RequestError {
  override name = 'UserRejectedRequestError'
  code = 4001

  constructor(err: Error) {
    super(err, {
      shortMessage: 'User rejected the request.',
    })
  }
}

export class SwitchChainError extends RequestError {
  override name = 'SwitchChainError'
  code = 4902

  constructor(err: Error) {
    super(err, {
      shortMessage: 'An error occurred when attempting to switch chain.',
    })
  }
}

export class UnknownRpcError extends RequestError {
  override name = 'UnknownRpcError'

  constructor(err: Error) {
    super(err, {
      shortMessage: 'An unknown RPC error occurred.',
    })
  }
}
