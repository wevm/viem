import type { Chain } from '../types'
import type { Requests } from '../types/eip1193'
import { uid } from '../utils/uid'
import type { BaseRpcRequests, Transport } from './transports/createTransport'

export type ClientConfig<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
> = {
  /** Chain for the client. */
  chain?: TChain
  /** A key for the client. */
  key?: string
  /** A name for the client. */
  name?: string
  /**
   * Frequency (in ms) for polling enabled actions & events.
   * @default 4_000
   */
  pollingInterval?: number
  /** The RPC transport */
  transport: TTransport
  /** The type of client. */
  type?: string
}

export type Client<
  TTransport extends Transport = Transport,
  TRequests extends BaseRpcRequests = Requests,
  TChain extends Chain | undefined = Chain | undefined,
> = {
  /** Chain for the client. */
  chain: TChain
  /** A key for the client. */
  key: string
  /** A name for the client. */
  name: string
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval: number
  /** Request function wrapped with friendly error handling */
  request: TRequests['request']
  /** The RPC transport */
  transport: ReturnType<TTransport>['config'] & ReturnType<TTransport>['value']
  /** The type of client. */
  type: string
  /** A unique ID for the client. */
  uid: string
}

/**
 * @description Creates a base client with the given transport.
 */
export function createClient<
  TTransport extends Transport,
  TRequests extends BaseRpcRequests,
  TChain extends Chain | undefined = undefined,
>({
  chain,
  key = 'base',
  name = 'Base Client',
  pollingInterval = 4_000,
  transport,
  type = 'base',
}: ClientConfig<TTransport, TChain>): Client<TTransport, TRequests, TChain> {
  const { config, request, value } = transport({ chain })
  return {
    chain: chain as TChain,
    key,
    name,
    pollingInterval,
    request,
    transport: { ...config, ...value },
    type,
    uid: uid(),
  }
}
