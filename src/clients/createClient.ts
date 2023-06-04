import type { Chain } from '../types/chain.js'
import type {
  EIP1193RequestFn,
  EIP1474Methods,
  RpcSchema,
} from '../types/eip1193.js'
import { uid } from '../utils/uid.js'
import type { Transport } from './transports/createTransport.js'

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
  TRpcSchema extends RpcSchema | undefined = undefined,
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
  request: TRpcSchema extends undefined
    ? EIP1193RequestFn<EIP1474Methods>
    : EIP1193RequestFn<TRpcSchema>
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
  TRpcSchema extends RpcSchema | undefined = undefined,
  TChain extends Chain | undefined = undefined,
>({
  chain,
  key = 'base',
  name = 'Base Client',
  pollingInterval = 4_000,
  transport,
  type = 'base',
}: ClientConfig<TTransport, TChain>): Client<TTransport, TRpcSchema, TChain> {
  const { config, request, value } = transport({ chain, pollingInterval })
  return {
    chain: chain as TChain,
    key,
    name,
    pollingInterval,
    request: request as any,
    transport: { ...config, ...value },
    type,
    uid: uid(),
  }
}
