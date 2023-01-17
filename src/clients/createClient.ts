import type { Chain } from '../chains'
import type { Requests } from '../types/eip1193'
import { buildRequest } from '../utils/buildRequest'
import { uid } from '../utils/uid'
import type { BaseRpcRequests, Transport } from './transports/createTransport'

export type Client<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
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
  /** The RPC transport (http, webSocket, ethereumProvider, etc) */
  transport: ReturnType<TTransport>['config'] & ReturnType<TTransport>['value']
  /** The type of client. */
  type: string
  /** A unique ID for the client. */
  uid: string
}

export type ClientConfig<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TRequests extends BaseRpcRequests = Requests,
> = Partial<
  Pick<
    Client<TTransport, TChain, TRequests>,
    'chain' | 'key' | 'name' | 'pollingInterval' | 'type'
  >
> & {
  transport: TTransport
}

/**
 * @description Creates a base RPC client with the given transport.
 *
 * - Intended to be used as a base for other RPC clients.
 * - Has access to _all_ EIP-1474 RPC methods.
 *
 * @example
 * import { mainnet } from 'viem/chains'
 * import { createClient, http } from 'viem/clients'
 * const client = createClient(http({ chain: mainnet }))
 */
export function createClient<
  TTransport extends Transport,
  TChain extends Chain,
  TRequests extends BaseRpcRequests,
>({
  chain,
  key = 'base',
  name = 'Base Client',
  pollingInterval = 4_000,
  transport,
  type = 'base',
}: ClientConfig<TTransport, TChain, TRequests>): Client<
  TTransport,
  TChain,
  TRequests
> {
  const { config, value } = transport({ chain })
  return {
    chain,
    key,
    name,
    pollingInterval,
    request: buildRequest(config.request),
    transport: { ...config, ...value },
    type,
    uid: uid(),
  }
}
