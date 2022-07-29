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
  ResourceNotFoundRpcError,
  ResourceUnavailableRpcError,
  RpcError,
  TransactionRejectedRpcError,
} from './errors'

export function buildRequest<TRequest extends (args: any) => Promise<any>>(
  request: TRequest,
) {
  return (async (args: any) => {
    try {
      return await request(args)
    } catch (err) {
      if ((<RpcError>err).code === -32700)
        throw new ParseRpcError(<RpcError>err)
      if ((<RpcError>err).code === -32600)
        throw new InvalidRequestRpcError(<RpcError>err)
      if ((<RpcError>err).code === -32601)
        throw new MethodNotFoundRpcError(<RpcError>err)
      if ((<RpcError>err).code === -32602)
        throw new InvalidParamsRpcError(<RpcError>err)
      if ((<RpcError>err).code === -32603)
        throw new InternalRpcError(<RpcError>err)
      if ((<RpcError>err).code === -32000)
        throw new InvalidInputRpcError(<RpcError>err)
      if ((<RpcError>err).code === -32001)
        throw new ResourceNotFoundRpcError(<RpcError>err)
      if ((<RpcError>err).code === -32002)
        throw new ResourceUnavailableRpcError(<RpcError>err)
      if ((<RpcError>err).code === -32003)
        throw new TransactionRejectedRpcError(<RpcError>err)
      if ((<RpcError>err).code === -32004)
        throw new MethodNotSupportedRpcError(<RpcError>err)
      if ((<RpcError>err).code === -32005)
        throw new LimitExceededRpcError(<RpcError>err)
      if ((<RpcError>err).code === -32006)
        throw new JsonRpcVersionUnsupportedError(<RpcError>err)
      if ((<RpcError>err).code === -32602)
        throw new InvalidParamsRpcError(<RpcError>err)
      throw err
    }
  }) as TRequest
}
