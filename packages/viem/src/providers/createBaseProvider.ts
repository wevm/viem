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
  TId extends string = string,
> = {
  /** The chains that are configured with the provider. */
  chains: TChain[]
  /** A identifier for the provider. */
  id: TId
  /** A name for the provider. */
  name: string
  /** The JSON-RPC request function that matches the EIP-1193 request spec. */
  request: TRequestFn
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
  TId extends string = string,
>({
  chains,
  id,
  name,
  request,
}: BaseProvider<TChain, TRequestFn, TId>): BaseProvider<
  TChain,
  TRequestFn,
  TId
> {
  return {
    chains,
    id,
    name,
    request: buildRequest(request),
  }
}
