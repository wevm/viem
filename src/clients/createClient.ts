import type { Address } from 'abitype'

import type { JsonRpcAccount } from '../accounts/types.js'
import type { ParseAccountErrorType } from '../accounts/utils/parseAccount.js'
import type { ErrorType } from '../errors/utils.js'
import type { Account } from '../types/account.js'
import type { Chain } from '../types/chain.js'
import type {
  EIP1193RequestFn,
  EIP1474Methods,
  RpcSchema,
} from '../types/eip1193.js'
import type { Prettify } from '../types/utils.js'
import { parseAccount } from '../utils/accounts.js'
import { uid } from '../utils/uid.js'
import type { PublicActions } from './decorators/public.js'
import type { WalletActions } from './decorators/wallet.js'
import type { Transport } from './transports/createTransport.js'

export type ClientConfig<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  accountOrAddress extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = {
  /** The Account to use for the Client. This will be used for Actions that require an account as an argument. */
  account?: accountOrAddress | Account | Address | undefined
  /** Flags for batch settings. */
  batch?:
    | {
        /** Toggle to enable `eth_call` multicall aggregation. */
        multicall?: boolean | Prettify<MulticallBatchOptions> | undefined
      }
    | undefined
  /**
   * Time (in ms) that cached data will remain in memory.
   * @default 4_000
   */
  cacheTime?: number | undefined
  /** Chain for the client. */
  chain?: Chain | undefined | chain
  /** A key for the client. */
  key?: string | undefined
  /** A name for the client. */
  name?: string | undefined
  /**
   * Frequency (in ms) for polling enabled actions & events.
   * @default 4_000
   */
  pollingInterval?: number | undefined
  /** The RPC transport */
  transport: transport
  /** The type of client. */
  type?: string | undefined
}

// Actions that are used internally by other Actions (ie. `call` is used by `readContract`).
// They are allowed to be extended, but must conform to their parameter & return type interfaces.
// Example: an extended `call` action must accept `CallParameters` as parameters,
// and conform to the `CallReturnType` return type.
type ExtendableProtectedActions<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = Pick<
  PublicActions<transport, chain, account>,
  | 'call'
  | 'createContractEventFilter'
  | 'createEventFilter'
  | 'estimateContractGas'
  | 'estimateGas'
  | 'getBlock'
  | 'getBlockNumber'
  | 'getChainId'
  | 'getContractEvents'
  | 'getEnsText'
  | 'getFilterChanges'
  | 'getGasPrice'
  | 'getLogs'
  | 'getTransaction'
  | 'getTransactionCount'
  | 'getTransactionReceipt'
  | 'prepareTransactionRequest'
  | 'readContract'
  | 'sendRawTransaction'
  | 'simulateContract'
  | 'uninstallFilter'
  | 'watchBlockNumber'
  | 'watchContractEvent'
> &
  Pick<WalletActions<chain, account>, 'sendTransaction' | 'writeContract'>

// TODO: Move `transport` to slot index 2 since `chain` and `account` used more frequently.
// Otherwise, we end up with a lot of `Client<Transport, chain, account>` in actions.
export type Client<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
  extended extends Extended | undefined = Extended | undefined,
> = Client_Base<transport, chain, account, rpcSchema> &
  (extended extends Extended ? extended : unknown) & {
    extend: <
      const client extends Extended &
        Partial<ExtendableProtectedActions<transport, chain, account>>,
    >(
      fn: (
        client: Client<transport, chain, account, rpcSchema, extended>,
      ) => client,
    ) => Client<
      transport,
      chain,
      account,
      rpcSchema,
      Prettify<client> & (extended extends Extended ? extended : unknown)
    >
  }

type Client_Base<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = {
  /** The Account of the Client. */
  account: account
  /** Flags for batch settings. */
  batch?: ClientConfig['batch'] | undefined
  /** Time (in ms) that cached data will remain in memory. */
  cacheTime: number
  /** Chain for the client. */
  chain: chain
  /** A key for the client. */
  key: string
  /** A name for the client. */
  name: string
  /** Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds. */
  pollingInterval: number
  /** Request function wrapped with friendly error handling */
  request: EIP1193RequestFn<
    rpcSchema extends undefined ? EIP1474Methods : rpcSchema
  >
  /** The RPC transport */
  transport: ReturnType<transport>['config'] & ReturnType<transport>['value']
  /** The type of client. */
  type: string
  /** A unique ID for the client. */
  uid: string
}

type Extended = Prettify<
  // disallow redefining base properties
  { [_ in keyof Client_Base]?: undefined } & {
    [key: string]: unknown
  }
>

export type MulticallBatchOptions = {
  /** The maximum size (in bytes) for each calldata chunk. @default 1_024 */
  batchSize?: number | undefined
  /** The maximum number of milliseconds to wait before sending a batch. @default 0 */
  wait?: number | undefined
}

export type CreateClientErrorType = ParseAccountErrorType | ErrorType

/**
 * Creates a base client with the given transport.
 */
export function createClient<
  transport extends Transport,
  chain extends Chain | undefined = undefined,
  accountOrAddress extends Account | Address | undefined = undefined,
>(
  parameters: ClientConfig<transport, chain, accountOrAddress>,
): Prettify<
  Client<
    transport,
    chain,
    accountOrAddress extends Address
      ? Prettify<JsonRpcAccount<accountOrAddress>>
      : accountOrAddress
  >
>

export function createClient(parameters: ClientConfig): Client {
  const {
    batch,
    cacheTime = parameters.pollingInterval ?? 4_000,
    key = 'base',
    name = 'Base Client',
    pollingInterval = 4_000,
    type = 'base',
  } = parameters

  const chain = parameters.chain
  const account = parameters.account
    ? parseAccount(parameters.account)
    : undefined
  const { config, request, value } = parameters.transport({
    chain,
    pollingInterval,
  })
  const transport = { ...config, ...value }

  const client = {
    account,
    batch,
    cacheTime,
    chain,
    key,
    name,
    pollingInterval,
    request,
    transport,
    type,
    uid: uid(),
  }

  function extend(base: typeof client) {
    type ExtendFn = (base: typeof client) => unknown
    return (extendFn: ExtendFn) => {
      const extended = extendFn(base) as Extended
      for (const key in client) delete extended[key]
      const combined = { ...base, ...extended }
      return Object.assign(combined, { extend: extend(combined) })
    }
  }

  return Object.assign(client, { extend: extend(client) as any })
}
