import type { Chain } from '../../types/chain.js'
import type { Requests } from '../../types/eip1193.js'
import { buildRequest } from '../../utils/buildRequest.js'
import type { ClientConfig } from '../createClient.js'

export type BaseRpcRequests = {
  request(...args: any): Promise<any>
}

export type TransportConfig<
  TType extends string = string,
  TRequests extends BaseRpcRequests['request'] = Requests['request'],
> = {
  /** The name of the transport. */
  name: string
  /** The key of the transport. */
  key: string
  /** The JSON-RPC request function that matches the EIP-1193 request spec. */
  request: TRequests
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
  TRequests extends BaseRpcRequests['request'] = Requests['request'],
> = <TChain extends Chain | undefined = Chain>({
  chain,
}: {
  chain?: TChain
  pollingInterval?: ClientConfig['pollingInterval']
  retryCount?: TransportConfig['retryCount']
  timeout?: TransportConfig['timeout']
}) => {
  config: TransportConfig<TType>
  request: TRequests
  value?: TRpcAttributes
}

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
