import { Chain } from '../../chains'
import { Requests } from '../../types/eip1193'

export type BaseRpcRequests = {
  request(...args: any): Promise<any>
}

export type TransportConfig<
  TType extends string = string,
  TRequests extends BaseRpcRequests['request'] = Requests['request'],
> = {
  /** Chain that is configured with the transport. */
  chain?: Chain
  /** The name of the transport. */
  name: string
  /** The key of the transport. */
  key: string
  /** The JSON-RPC request function that matches the EIP-1193 request spec. */
  request: TRequests
  /** The type of the transport. */
  type: TType
}

export type Transport<
  TType extends string = string,
  TRpcAttributes = Record<string, any>,
> = {
  config: TransportConfig<TType>
  value?: TRpcAttributes
}

/**
 * @description Creates an transport intended to be used with a client.
 */
export function createTransport<
  TType extends string = string,
  TRpcAttributes = any,
>(
  config: TransportConfig<TType>,
  value?: TRpcAttributes,
): Transport<TType, TRpcAttributes> {
  return {
    config,
    value,
  }
}
