import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { buildRequest } from '../../utils/buildRequest.js'
import type { ClientConfig } from '../createClient.js'

export type TransportConfig<
  TType extends string = string,
  TEIP1193RequestFn extends EIP1193RequestFn = EIP1193RequestFn,
> = {
  /** The name of the transport. */
  name: string
  /** The key of the transport. */
  key: string
  /** The JSON-RPC request function that matches the EIP-1193 request spec. */
  request: TEIP1193RequestFn
  /** The base delay (in ms) between retries. */
  retryDelay?: number
  /** The max number of times to retry. */
  retryCount?: number
  /** The timeout (in ms) for requests. */
  timeout?: number
  /** The type of the transport. */
  type: TType
}

export type Transport<
  TType extends string = string,
  TRpcAttributes = Record<string, any>,
  TEIP1193RequestFn extends EIP1193RequestFn = EIP1193RequestFn,
> = <TChain extends Chain | undefined = Chain>({
  chain,
}: {
  chain?: TChain
  pollingInterval?: ClientConfig['pollingInterval']
  retryCount?: TransportConfig['retryCount']
  timeout?: TransportConfig['timeout']
}) => {
  config: TransportConfig<TType>
  request: TEIP1193RequestFn
  value?: TRpcAttributes
}

export type CreateTransportErrorType = ErrorType

/**
 * @description Creates an transport intended to be used with a client.
 */
export function createTransport<
  TType extends string,
  TRpcAttributes extends Record<string, any>,
>(
  {
    key,
    name,
    request,
    retryCount = 3,
    retryDelay = 150,
    timeout,
    type,
  }: TransportConfig<TType>,
  value?: TRpcAttributes,
): ReturnType<Transport<TType, TRpcAttributes>> {
  return {
    config: { key, name, request, retryCount, retryDelay, timeout, type },
    request: buildRequest(request, { retryCount, retryDelay }),
    value,
  }
}
