export class ProviderRpcError extends Error {
  code: number

  name = 'ProviderRpcError'

  constructor(
    { code, message }: { code: number; message: string },
    humanMessage: string,
  ) {
    super([humanMessage, '', 'Details: ' + message].join('\n'))
    this.code = code
  }
}

export class RpcError extends Error {
  code: number

  name = 'RpcError'

  constructor(
    { code, message }: { code: number; message: string },
    humanMessage: string,
  ) {
    super([humanMessage, '', 'Details: ' + message].join('\n'))
    this.code = code
  }
}

export class RequestError extends Error {
  code: number

  name = 'RequestError'

  constructor({ code, message }: { code: number; message: string }) {
    super(message)
    this.code = code
  }
}

export class ParseRpcError extends RpcError {
  name = 'ParseRpcError'
  code = -32700

  constructor(err: RpcError) {
    super(
      err,
      'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
    )
  }
}

export class InvalidRequestRpcError extends RpcError {
  name = 'InvalidRequestRpcError'
  code = -32600

  constructor(err: RpcError) {
    super(err, 'JSON is not a valid request object.')
  }
}

export class MethodNotFoundRpcError extends RpcError {
  name = 'MethodNotFoundRpcError'
  code = -32601

  constructor(err: RpcError) {
    super(err, 'The method does not exist / is not available.')
  }
}

export class InvalidParamsRpcError extends RpcError {
  name = 'InvalidParamsRpcError'
  code = -32602

  constructor(err: RpcError, { docsLink }: { docsLink?: string } = {}) {
    super(
      err,
      [
        'Invalid parameters were provided to the RPC method.',
        'Double check you have provided the correct parameters.',
        ...(docsLink ? ['', 'Docs: https://sad.com/'] : []),
      ].join('\n'),
    )
  }
}

export class InternalRpcError extends RpcError {
  name = 'InternalRpcError'
  code = -32603

  constructor(err: RpcError) {
    super(err, 'An internal error was received.')
  }
}

export class InvalidInputRpcError extends RpcError {
  name = 'InvalidInputRpcError'
  code = -32000

  constructor(err: RpcError, { docsLink }: { docsLink?: string } = {}) {
    super(
      err,
      [
        'Missing or invalid parameters.',
        'Double check you have provided the correct parameters.',
        ...(docsLink ? ['', `Docs: ${docsLink}`] : []),
      ].join('\n'),
    )
  }
}

export class ResourceNotFoundRpcError extends RpcError {
  name = 'ResourceNotFoundRpcError'
  code = -32001

  constructor(err: RpcError) {
    super(err, 'Requested resource not found.')
  }
}

export class ResourceUnavailableRpcError extends RpcError {
  name = 'ResourceUnavailableRpcError'
  code = -32002

  constructor(err: RpcError) {
    super(err, 'Requested resource not available.')
  }
}

export class TransactionRejectedRpcError extends RpcError {
  name = 'TransactionRejectedRpcError'
  code = -32003

  constructor(err: RpcError) {
    super(err, 'Transaction creation failed.')
  }
}

export class MethodNotSupportedRpcError extends RpcError {
  name = 'MethodNotSupportedRpcError'
  code = -32004

  constructor(err: RpcError) {
    super(err, 'Method is not implemented.')
  }
}

export class LimitExceededRpcError extends RpcError {
  name = 'LimitExceededRpcError'
  code = -32005

  constructor(err: RpcError) {
    super(err, 'Request exceeds defined limit.')
  }
}

export class JsonRpcVersionUnsupportedError extends RpcError {
  name = 'JsonRpcVersionUnsupportedError'
  code = -32006

  constructor(err: RpcError) {
    super(err, 'Version of JSON-RPC protocol is not supported.')
  }
}
