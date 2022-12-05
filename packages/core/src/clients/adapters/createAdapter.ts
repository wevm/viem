import { Chain } from '../../chains'
import { Requests } from '../../types/eip1193'

export type BaseRpcRequests = {
  request(...args: any): Promise<any>
}

export type AdapterConfig<
  TType extends string = string,
  TRequests extends BaseRpcRequests['request'] = Requests['request'],
> = {
  /** Chain that is configured with the adapter. */
  chain?: Chain
  /** The name of the adapter. */
  name: string
  /** The key of the adapter. */
  key: string
  /** The JSON-RPC request function that matches the EIP-1193 request spec. */
  request: TRequests
  /** The type of the adapter. */
  type: TType
}

export type Adapter<
  TType extends string = string,
  TRpcAttributes = Record<string, any>,
> = {
  config: AdapterConfig<TType>
  value?: TRpcAttributes
}

/**
 * @description Creates an adapter intended to be used with an RPC client.
 */
export function createAdapter<
  TType extends string = string,
  TRpcAttributes = any,
>(
  config: AdapterConfig<TType>,
  value?: TRpcAttributes,
): Adapter<TType, TRpcAttributes> {
  return {
    config,
    value,
  }
}
