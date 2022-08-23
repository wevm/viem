import { Chain } from '../chains'
import { PublicRequests } from '../types/ethereum-provider'
import { buildRequest } from '../utils/buildRequest'

export type BaseProviderRequestFn = <TMethod extends string>({
  method,
  params,
}: {
  method: TMethod
  params?: any[]
}) => Promise<any>

export type BaseProvider<
  TChain extends Chain = Chain,
  TRequestFn extends BaseProviderRequestFn = PublicRequests['request'],
  TKey extends string = string,
  TType extends string = string,
> = {
  /** The chains that are configured with the provider. */
  chains: TChain[]
  /** A key for the provider. */
  key: TKey
  /** A name for the provider. */
  name: string
  /** The JSON-RPC request function that matches the EIP-1193 request spec. */
  request: TRequestFn
  /** The type of provider. */
  type: TType
  /** A unique ID for the provider. */
  uniqueId: string
}

/**
 * @description Creates a base provider with configured chains & a request function. Intended
 * to be used as a base for other providers.
 *
 * @example
 * const baseProvider = createBaseProvider({
 *  request: (method, params) => rpc.send(method, params),
 * })
 */
export function createBaseProvider<
  TChain extends Chain,
  TRequestFn extends BaseProviderRequestFn,
  TKey extends string,
  TType extends string,
>({
  chains,
  key,
  name,
  request,
  type,
  uniqueId,
}: BaseProvider<TChain, TRequestFn, TKey, TType>): BaseProvider<
  TChain,
  TRequestFn,
  TKey,
  TType
> {
  return {
    chains,
    key,
    name,
    request: buildRequest(request),
    type,
    uniqueId,
  }
}
