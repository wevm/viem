import { PublicRequests } from '../types/ethereum-provider'
import { buildRequest } from '../utils/buildRequest'
import { uid } from '../utils/uid'

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type BaseProviderRequests = {
  request(...args: any): Promise<any>
}

export type BaseProvider<
  TRequests extends BaseProviderRequests = PublicRequests,
  TKey extends string = string,
  TType extends string = string,
> = {
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
  uid: string
}

export type BaseProviderConfig<
  TRequests extends BaseProviderRequests = PublicRequests,
  TKey extends string = string,
  TType extends string = string,
> = Omit<
  PartialBy<BaseProvider<TRequests, TKey, TType>, 'pollingInterval'>,
  'uid'
>

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
  TRequests extends BaseProviderRequests,
  TKey extends string,
  TType extends string,
>({
  key,
  name,
  pollingInterval = 4_000,
  request,
  type,
}: BaseProviderConfig<TRequests, TKey, TType>): BaseProvider<
  TRequests,
  TKey,
  TType
> {
  return {
    key,
    name,
    pollingInterval,
    request: buildRequest(request),
    type,
    uid: uid(),
  }
}
