import { Chain } from '../chains'
import { PublicRequests } from '../types/ethereum-provider'
import { buildRequest } from '../utils/buildRequest'

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type BaseProviderRequests = {
  request(...args: any): Promise<any>
}

export type BaseProvider<
  TChain extends Chain = Chain,
  TRequests extends BaseProviderRequests = PublicRequests,
  TKey extends string = string,
  TType extends string = string,
> = {
  /** The chains that are configured with the provider. */
  chains: TChain[]
  /** A key for the provider. */
  key: TKey
  /** A name for the provider. */
  name: string
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval: number
  /** The JSON-RPC request function that matches the EIP-1193 request spec. */
  request: TRequests['request']
  /** The type of provider. */
  type: TType
  /** A unique ID for the provider. */
  uniqueId: string
}

export type BaseProviderConfig<
  TChain extends Chain = Chain,
  TRequests extends BaseProviderRequests = PublicRequests,
  TKey extends string = string,
  TType extends string = string,
> = PartialBy<BaseProvider<TChain, TRequests, TKey, TType>, 'pollingInterval'>

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
  TRequests extends BaseProviderRequests,
  TKey extends string,
  TType extends string,
>({
  chains,
  key,
  name,
  pollingInterval = 4_000,
  request,
  type,
  uniqueId,
}: BaseProviderConfig<TChain, TRequests, TKey, TType>): BaseProvider<
  TChain,
  TRequests,
  TKey,
  TType
> {
  return {
    chains,
    key,
    name,
    pollingInterval,
    request: buildRequest(request),
    type,
    uniqueId,
  }
}
