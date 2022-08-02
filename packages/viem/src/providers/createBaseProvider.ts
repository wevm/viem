import { Chain } from '../chains'
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
  TRequestFn extends BaseProviderRequestFn = BaseProviderRequestFn,
> = {
  /** The chains that are configured with the provider. */
  chains: TChain[]
  /** A identifier for the provider. */
  id: string
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
>({
  chains,
  id,
  name,
  request,
}: BaseProvider<TChain, TRequestFn>): BaseProvider<TChain, TRequestFn> {
  return {
    chains,
    id,
    name,
    request: buildRequest(request),
  }
}
