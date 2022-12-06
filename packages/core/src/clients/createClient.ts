import type { Requests } from '../types/eip1193'
import { buildRequest } from '../utils/buildRequest'
import { uid } from '../utils/uid'
import type { BaseRpcRequests, Transport } from './transports/createTransport'

export type Client<
  TTransport extends Transport = Transport,
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
  /** The RPC transport (http, webSocket, ethereumProvider, etc) */
  transport: TTransport['config'] & TTransport['value']
  /** The type of client. */
  type: string
  /** A unique ID for the client. */
  uid: string
}

export type ClientConfig<
  TTransport extends Transport = Transport,
  TRequests extends BaseRpcRequests = Requests,
> = Partial<
  Pick<
    Client<TTransport, TRequests>,
    'key' | 'name' | 'pollingInterval' | 'type'
  >
>

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
  TRequests extends BaseRpcRequests,
>(
  transport: TTransport,
  {
    key = 'base',
    name = 'Base Client',
    pollingInterval = 4_000,
    type = 'base',
  }: ClientConfig<TTransport, TRequests> = {},
): Client<TTransport, TRequests> {
  const { config, value } = transport
  return {
    transport: { ...config, ...value },
    key,
    name,
    pollingInterval,
    request: buildRequest(config.request),
    type,
    uid: uid(),
  }
}
