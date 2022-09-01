import { BaseError } from './BaseError'

export function buildRequest<TRequest extends (args: any) => Promise<any>>(
  request: TRequest,
) {
  return (async (args: any) => {
    try {
      return await request(args)
    } catch (err) {
      if ((<RequestError>err).code === -32700)
        throw new ParseRpcError(<RequestError>err)
      if ((<RequestError>err).code === -32600)
        throw new InvalidRequestRpcError(<RequestError>err)
      if ((<RequestError>err).code === -32601)
        throw new MethodNotFoundRpcError(<RequestError>err)
      if ((<RequestError>err).code === -32602)
        throw new InvalidParamsRpcError(<RequestError>err)
      if ((<RequestError>err).code === -32603)
        throw new InternalRpcError(<RequestError>err)
      if ((<RequestError>err).code === -32000)
        throw new InvalidInputRpcError(<RequestError>err)
      if ((<RequestError>err).code === -32001)
        throw new ResourceNotFoundRpcError(<RequestError>err)
      if ((<RequestError>err).code === -32002)
        throw new ResourceUnavailableRpcError(<RequestError>err)
      if ((<RequestError>err).code === -32003)
        throw new TransactionRejectedRpcError(<RequestError>err)
      if ((<RequestError>err).code === -32004)
        throw new MethodNotSupportedRpcError(<RequestError>err)
      if ((<RequestError>err).code === -32005)
        throw new LimitExceededRpcError(<RequestError>err)
      if ((<RequestError>err).code === -32006)
        throw new JsonRpcVersionUnsupportedError(<RequestError>err)
      if ((<RequestError>err).code === -32602)
        throw new InvalidParamsRpcError(<RequestError>err)
      throw new RpcError(<RequestError>err, {
        humanMessage: 'An unknown error occurred.',
      })
    }
  }) as TRequest
}

////////////////////////////////////////////////////////////

export class RequestError extends BaseError {
  code: number

  name = 'RequestError'

  constructor({ code, message }: { code: number; message: string }) {
    super({ humanMessage: 'Could not make request.', details: message })
    this.code = code
  }
}

export class RpcError extends BaseError {
  code: number

  name = 'RpcError'

  constructor(
    {
      code,
      details,
      humanMessage: humanMessage_,
      message,
    }: {
      code: number
      details?: string
      humanMessage?: string
      message: string
    },
    { docsLink, humanMessage }: { docsLink?: string; humanMessage: string },
  ) {
    super({
      humanMessage: humanMessage_ || humanMessage,
      details: details || message,
      docsLink,
    })
    this.code = code
  }
}

export class ParseRpcError extends RpcError {
  name = 'ParseRpcError'
  code = -32700

  constructor(err: RpcError) {
    super(err, {
      humanMessage:
        'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
    })
  }
}

export class InvalidRequestRpcError extends RpcError {
  name = 'InvalidRequestRpcError'
  code = -32600

  constructor(err: RpcError) {
    super(err, { humanMessage: 'JSON is not a valid request object.' })
  }
}

export class MethodNotFoundRpcError extends RpcError {
  name = 'MethodNotFoundRpcError'
  code = -32601

  constructor(err: RpcError) {
    super(err, {
      humanMessage: 'The method does not exist / is not available.',
    })
  }
}

export class InvalidParamsRpcError extends RpcError {
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

export class InternalRpcError extends RpcError {
  name = 'InternalRpcError'
  code = -32603

  constructor(err: RpcError) {
    super(err, { humanMessage: 'An internal error was received.' })
  }
}

export class InvalidInputRpcError extends RpcError {
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

export class ResourceNotFoundRpcError extends RpcError {
  name = 'ResourceNotFoundRpcError'
  code = -32001

  constructor(err: RpcError) {
    super(err, { humanMessage: 'Requested resource not found.' })
  }
}

export class ResourceUnavailableRpcError extends RpcError {
  name = 'ResourceUnavailableRpcError'
  code = -32002

  constructor(err: RpcError) {
    super(err, { humanMessage: 'Requested resource not available.' })
  }
}

export class TransactionRejectedRpcError extends RpcError {
  name = 'TransactionRejectedRpcError'
  code = -32003

  constructor(err: RpcError) {
    super(err, { humanMessage: 'Transaction creation failed.' })
  }
}

export class MethodNotSupportedRpcError extends RpcError {
  name = 'MethodNotSupportedRpcError'
  code = -32004

  constructor(err: RpcError) {
    super(err, { humanMessage: 'Method is not implemented.' })
  }
}

export class LimitExceededRpcError extends RpcError {
  name = 'LimitExceededRpcError'
  code = -32005

  constructor(err: RpcError) {
    super(err, { humanMessage: 'Request exceeds defined limit.' })
  }
}

export class JsonRpcVersionUnsupportedError extends RpcError {
  name = 'JsonRpcVersionUnsupportedError'
  code = -32006

  constructor(err: RpcError) {
    super(err, {
      humanMessage: 'Version of JSON-RPC protocol is not supported.',
    })
  }
}
