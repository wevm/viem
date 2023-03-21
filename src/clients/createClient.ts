import type { Chain, IsUndefined } from '../types'
import type { Requests } from '../types/eip1193'
import { uid } from '../utils/uid'
import type { BaseRpcRequests, Transport } from './transports/createTransport'

export type Client<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain,
  TRequests extends BaseRpcRequests = Requests,
> = {
  /** Chain for the client. */
  chain?: TChain
  /** A key for the client. */
  key: string
  /** A name for the client. */
  name: string
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval: number
  /** Request function wrapped with friendly error handling */
  request: TRequests['request']
  /** The RPC transport (http, webSocket, custom, etc) */
  transport: ReturnType<TTransport>['config'] & ReturnType<TTransport>['value']
  /** The type of client. */
  type: string
  /** A unique ID for the client. */
  uid: string
}

export type ClientConfig<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain,
  TRequests extends BaseRpcRequests = Requests,
> = Partial<
  Pick<
    Client<TTransport, TChain, TRequests>,
    'chain' | 'key' | 'name' | 'pollingInterval' | 'type'
  >
> & {
  transport: TTransport
}

export type CreateClientReturnType<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain,
  TRequests extends BaseRpcRequests = Requests,
> = {
  /** A key for the client. */
  key: string
  /** A name for the client. */
  name: string
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval: number
  /** Request function wrapped with friendly error handling */
  request: TRequests['request']
  /** The RPC transport (http, webSocket, custom, etc) */
  transport: ReturnType<TTransport>['config'] & ReturnType<TTransport>['value']
  /** The type of client. */
  type: string
  /** A unique ID for the client. */
  uid: string
} & (IsUndefined<TChain> extends true
  ? unknown
  : {
      /** Chain for the client. */
      chain: TChain
    })

/**
 * @description Creates a base client with the given transport.
 */
export function createClient<
  TTransport extends Transport,
  TChain extends Chain | undefined,
  TRequests extends BaseRpcRequests,
>({
  chain,
  key = 'base',
  name = 'Base Client',
  pollingInterval = 4_000,
  transport,
  type = 'base',
}: ClientConfig<TTransport, TChain, TRequests>): CreateClientReturnType<
  TTransport,
  TChain,
  TRequests
> {
  const { config, request, value } = transport({ chain })
  return {
    chain,
    key,
    name,
    pollingInterval,
    request,
    transport: { ...config, ...value },
    type,
    uid: uid(),
  } as CreateClientReturnType<TTransport, TChain, TRequests>
}
