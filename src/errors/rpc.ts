import { BaseError } from './base.js'
import { RpcRequestError } from './request.js'

const unknownErrorCode = -1

export class RpcError extends BaseError {
  code: number

  constructor(
    err: Error,
    {
      code = unknownErrorCode,
      docsPath,
      metaMessages,
      shortMessage,
    }: {
      code?: number
      docsPath?: string
      metaMessages?: string[]
      shortMessage: string
    },
  ) {
    super(shortMessage, {
      cause: err,
      docsPath,
      metaMessages:
        metaMessages || (err as { metaMessages?: string[] })?.metaMessages,
    })
    this.name = err.name
    this.code = err instanceof RpcRequestError ? err.code : code
  }
}

export class ParseRpcError extends RpcError {
  override name = 'ParseRpcError'

  constructor(err: Error) {
    super(err, {
      code: -32700,
      shortMessage:
        'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
    })
  }
}

export class InvalidRequestRpcError extends RpcError {
  override name = 'InvalidRequestRpcError'

  constructor(err: Error) {
    super(err, {
      code: -32600,
      shortMessage: 'JSON is not a valid request object.',
    })
  }
}

export class MethodNotFoundRpcError extends RpcError {
  override name = 'MethodNotFoundRpcError'

  constructor(err: Error) {
    super(err, {
      code: -32601,
      shortMessage: 'The method does not exist / is not available.',
    })
  }
}

export class InvalidParamsRpcError extends RpcError {
  override name = 'InvalidParamsRpcError'

  constructor(err: Error) {
    super(err, {
      code: -32602,
      shortMessage: [
        'Invalid parameters were provided to the RPC method.',
        'Double check you have provided the correct parameters.',
      ].join('\n'),
    })
  }
}

export class InternalRpcError extends RpcError {
  override name = 'InternalRpcError'

  constructor(err: Error) {
    super(err, {
      code: -32603,
      shortMessage: 'An internal error was received.',
    })
  }
}

export class InvalidInputRpcError extends RpcError {
  override name = 'InvalidInputRpcError'

  constructor(err: Error) {
    super(err, {
      code: -32000,
      shortMessage: [
        'Missing or invalid parameters.',
        'Double check you have provided the correct parameters.',
      ].join('\n'),
    })
  }
}

export class ResourceNotFoundRpcError extends RpcError {
  override name = 'ResourceNotFoundRpcError'

  constructor(err: Error) {
    super(err, { code: -32001, shortMessage: 'Requested resource not found.' })
  }
}

export class ResourceUnavailableRpcError extends RpcError {
  override name = 'ResourceUnavailableRpcError'

  constructor(err: Error) {
    super(err, {
      code: -32002,
      shortMessage: 'Requested resource not available.',
    })
  }
}

export class TransactionRejectedRpcError extends RpcError {
  override name = 'TransactionRejectedRpcError'

  constructor(err: RpcError) {
    super(err, { code: -32003, shortMessage: 'Transaction creation failed.' })
  }
}

export class MethodNotSupportedRpcError extends RpcError {
  override name = 'MethodNotSupportedRpcError'

  constructor(err: RpcError) {
    super(err, { code: -32004, shortMessage: 'Method is not implemented.' })
  }
}

export class LimitExceededRpcError extends RpcError {
  override name = 'LimitExceededRpcError'

  constructor(err: RpcError) {
    super(err, { code: -32005, shortMessage: 'Request exceeds defined limit.' })
  }
}

export class JsonRpcVersionUnsupportedError extends RpcError {
  override name = 'JsonRpcVersionUnsupportedError'

  constructor(err: RpcError) {
    super(err, {
      code: -32006,
      shortMessage: 'Version of JSON-RPC protocol is not supported.',
    })
  }
}

export class UserRejectedRequestError extends RpcError {
  override name = 'UserRejectedRequestError'

  constructor(err: Error) {
    super(err, {
      code: 4001,
      shortMessage: 'User rejected the request.',
    })
  }
}

export class SwitchChainError extends RpcError {
  override name = 'SwitchChainError'

  constructor(err: Error) {
    super(err, {
      code: 4902,
      shortMessage: 'An error occurred when attempting to switch chain.',
    })
  }
}

export class UnknownRpcError extends RpcError {
  override name = 'UnknownRpcError'

  constructor(err: Error) {
    super(err, {
      shortMessage: 'An unknown RPC error occurred.',
    })
  }
}
