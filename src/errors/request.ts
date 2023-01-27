import { BaseError } from './base'
import { RpcError } from './rpc'

export class RequestError extends BaseError {
  constructor(
    err: Error,
    { docsPath, humanMessage }: { docsPath?: string; humanMessage: string },
  ) {
    super(humanMessage, {
      cause: err,
      docsPath,
    })
    this.name = err.name
  }
}

export class RpcRequestError extends RequestError {
  code: number

  constructor(
    err: RpcError,
    { docsPath, humanMessage }: { docsPath?: string; humanMessage: string },
  ) {
    super(err, { docsPath, humanMessage })
    this.code = err.code
    this.name = err.name
  }
}

export class ParseRpcError extends RpcRequestError {
  name = 'ParseRpcError'
  code = -32700

  constructor(err: RpcError) {
    super(err, {
      humanMessage:
        'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
    })
  }
}

export class InvalidRequestRpcError extends RpcRequestError {
  name = 'InvalidRequestRpcError'
  code = -32600

  constructor(err: RpcError) {
    super(err, { humanMessage: 'JSON is not a valid request object.' })
  }
}

export class MethodNotFoundRpcError extends RpcRequestError {
  name = 'MethodNotFoundRpcError'
  code = -32601

  constructor(err: RpcError) {
    super(err, {
      humanMessage: 'The method does not exist / is not available.',
    })
  }
}

export class InvalidParamsRpcError extends RpcRequestError {
  name = 'InvalidParamsRpcError'
  code = -32602

  constructor(err: RpcError) {
    super(err, {
      humanMessage: [
        'Invalid parameters were provided to the RPC method.',
        'Double check you have provided the correct parameters.',
      ].join('\n'),
    })
  }
}

export class InternalRpcError extends RpcRequestError {
  name = 'InternalRpcError'
  code = -32603

  constructor(err: RpcError) {
    super(err, { humanMessage: 'An internal error was received.' })
  }
}

export class InvalidInputRpcError extends RpcRequestError {
  name = 'InvalidInputRpcError'
  code = -32000

  constructor(err: RpcError) {
    super(err, {
      humanMessage: [
        'Missing or invalid parameters.',
        'Double check you have provided the correct parameters.',
      ].join('\n'),
    })
  }
}

export class ResourceNotFoundRpcError extends RpcRequestError {
  name = 'ResourceNotFoundRpcError'
  code = -32001

  constructor(err: RpcError) {
    super(err, { humanMessage: 'Requested resource not found.' })
  }
}

export class ResourceUnavailableRpcError extends RpcRequestError {
  name = 'ResourceUnavailableRpcError'
  code = -32002

  constructor(err: RpcError) {
    super(err, { humanMessage: 'Requested resource not available.' })
  }
}

export class TransactionRejectedRpcError extends RpcRequestError {
  name = 'TransactionRejectedRpcError'
  code = -32003

  constructor(err: RpcError) {
    super(err, { humanMessage: 'Transaction creation failed.' })
  }
}

export class MethodNotSupportedRpcError extends RpcRequestError {
  name = 'MethodNotSupportedRpcError'
  code = -32004

  constructor(err: RpcError) {
    super(err, { humanMessage: 'Method is not implemented.' })
  }
}

export class LimitExceededRpcError extends RpcRequestError {
  name = 'LimitExceededRpcError'
  code = -32005

  constructor(err: RpcError) {
    super(err, { humanMessage: 'Request exceeds defined limit.' })
  }
}

export class JsonRpcVersionUnsupportedError extends RpcRequestError {
  name = 'JsonRpcVersionUnsupportedError'
  code = -32006

  constructor(err: RpcError) {
    super(err, {
      humanMessage: 'Version of JSON-RPC protocol is not supported.',
    })
  }
}

export class UnknownRpcError extends RequestError {
  name = 'UnknownRpcError'

  constructor(err: Error) {
    super(err, {
      humanMessage: 'An unknown RPC error occurred.',
    })
  }
}
