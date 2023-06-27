import type { Address, Narrow } from 'abitype'

import type { Account, JsonRpcAccount } from '../accounts/types.js'
import type { ParseAccount } from '../types/account.js'
import type { Chain } from '../types/chain.js'
import type {
  EIP1193RequestFn,
  EIP1474Methods,
  RpcSchema,
} from '../types/eip1193.js'
import type { Prettify } from '../types/utils.js'
import { parseAccount } from '../utils/accounts.js'
import { uid } from '../utils/uid.js'
import type { Transport } from './transports/createTransport.js'

export type MulticallBatchOptions = {
  /** The maximum size (in bytes) for each calldata chunk. @default 1_024 */
  batchSize?: number
  /** The maximum number of milliseconds to wait before sending a batch. @default 0 */
  wait?: number
}

export type ClientConfig<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccountOrAddress extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = {
  /** The Account to use for the Client. This will be used for Actions that require an account as an argument. */
  account?: TAccountOrAddress
  /** Flags for batch settings. */
  batch?: {
    /** Toggle to enable `eth_call` multicall aggregation. */
    multicall?: boolean | MulticallBatchOptions
  }
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

type Client_Base<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TRpcSchema extends RpcSchema | undefined = undefined,
> = {
  /** The Account of the Client. */
  account: TAccount
  /** Flags for batch settings. */
  batch?: {
    /** Toggle to enable `eth_call` multicall aggregation. */
    multicall?: boolean | MulticallBatchOptions
  }
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

type Extended = { [K in keyof Client_Base]?: undefined } & {
  [key: string]: unknown
}

export type Client<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TRpcSchema extends RpcSchema | undefined = undefined,
  TExtended extends Extended | undefined = Extended | undefined,
> = Client_Base<TTransport, TChain, TAccount, TRpcSchema> & {
  extend: <TNextExtended extends Extended = Extended>(
    fn: (
      client: Client<TTransport, TChain, TAccount, TRpcSchema, TExtended>,
    ) => Narrow<TNextExtended>,
  ) => Client<
    TTransport,
    TChain,
    TAccount,
    TRpcSchema,
    (TExtended extends Extended ? TExtended : {}) & TNextExtended
  >
} & (TExtended extends Extended ? TExtended : {})

/**
 * @description Creates a base client with the given transport.
 */
export function createClient<
  TTransport extends Transport,
  TChain extends Chain | undefined = undefined,
  TAccountOrAddress extends Account | Address | undefined = undefined,
>({
  account,
  batch,
  chain,
  key = 'base',
  name = 'Base Client',
  pollingInterval = 4_000,
  transport,
  type = 'base',
}: ClientConfig<TTransport, TChain, TAccountOrAddress>): Client<
  TTransport,
  TChain,
  TAccountOrAddress extends Address
    ? Prettify<JsonRpcAccount<TAccountOrAddress>>
    : TAccountOrAddress
> {
  const { config, request, value } = transport({ chain, pollingInterval })
  const client = {
    account: (account
      ? parseAccount(account)
      : undefined) as ParseAccount<TAccountOrAddress>,
    batch,
    chain: chain as TChain,
    key,
    name,
    pollingInterval,
    request,
    transport: { ...config, ...value },
    type,
    uid: uid(),
  }
  function extend(client_: typeof client) {
    return (fn: (_: typeof client) => unknown) => {
      const extended = fn(client_) as Extended
      for (const key in client) delete extended[key]
      const nextClient = { ...client_, ...extended }
      return Object.assign(nextClient, { extend: extend(nextClient) })
    }
  }
  return Object.assign(client, { extend: extend(client) as any })
}
