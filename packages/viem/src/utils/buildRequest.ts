import {
  InternalRpcError,
  InvalidInputRpcError,
  InvalidParamsRpcError,
  InvalidRequestRpcError,
  JsonRpcVersionUnsupportedError,
  LimitExceededRpcError,
  MethodNotFoundRpcError,
  MethodNotSupportedRpcError,
  ParseRpcError,
  RequestError,
  ResourceNotFoundRpcError,
  ResourceUnavailableRpcError,
  TransactionRejectedRpcError,
} from './errors'

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
      throw err
    }
  }) as TRequest
}
