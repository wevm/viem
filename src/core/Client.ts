import type * as RpcSchema from 'ox/RpcSchema'

import type * as Errors from './Errors.js'
import type * as Transport from './Transport.js'
import type { ExactPartial } from './internal/types.js'
import { uid } from './internal/uid.js'

type TODO = any

type Account = TODO
type Chain = TODO
type PublicActions<_> = TODO
type WalletActions<_> = TODO

export type Client<
  chain extends Chain | undefined = Chain | undefined,
  rpcSchema extends RpcSchema.Generic = RpcSchema.Default,
  extended extends Extended | undefined = Extended | undefined,
> = Client_internal<chain, rpcSchema> &
  (extended extends Extended ? extended : unknown) & {
    extend: <
      const client extends Extended &
        ExactPartial<ExtendableProtectedActions<chain>>,
    >(
      fn: (client: Client<chain, rpcSchema, extended>) => client,
    ) => Client<
      chain,
      rpcSchema,
      client & (extended extends Extended ? extended : unknown)
    >
  }

export function from<
  chain extends Chain | undefined = undefined,
  rpcSchema extends RpcSchema.Generic = RpcSchema.Default,
>(parameters: from.Parameters<chain, rpcSchema>): Client<chain, rpcSchema>

/**
 * Instantiates a new Client.
 *
 * @example
 * TODO
 *
 * @param parameters - Parameters.
 * @returns Client.
 */
export function from(parameters: from.Parameters): from.ReturnType {
  const {
    cacheTime = parameters.pollingInterval ?? 4_000,
    chain,
    pollingInterval = 4_000,
  } = parameters

  const transport = parameters.transport.setup({
    chain,
    pollingInterval,
  })

  const client = {
    ...parameters,
    cacheTime,
    chain,
    request: transport.request,
    pollingInterval,
    transport,
    uid: uid(),
  } satisfies Client_internal

  function extend(base: typeof client) {
    type ExtendFn = (base: typeof client) => unknown
    return (extendFn: ExtendFn) => {
      const extended = extendFn(base) as Extended
      for (const key in client) delete extended[key]
      const combined = { ...base, ...extended }
      return Object.assign(combined, { extend: extend(combined as any) })
    }
  }

  return Object.assign(client, { extend: extend(client) })
}

export declare namespace from {
  export type Parameters<
    chain extends Chain | undefined = undefined,
    rpcSchema extends RpcSchema.Generic = RpcSchema.Default,
  > = Omit<ExactPartial<Client<chain, rpcSchema>>, 'transport'> & {
    transport: Transport.Transport
  }

  export type ReturnType<
    chain extends Chain | undefined = undefined,
    rpcSchema extends RpcSchema.Generic = RpcSchema.Default,
  > = Client<chain, rpcSchema>

  export type ErrorType = Errors.BaseError
}

/////////////////////////////////////////////////////////////////////////////////////
// Internal
/////////////////////////////////////////////////////////////////////////////////////

type Client_internal<
  chain extends Chain | undefined = Chain | undefined,
  rpcSchema extends RpcSchema.Generic = RpcSchema.Default,
> = {
  /**
   * Account binded to the Client.
   */
  account?: Account | undefined
  /**
   * Batch settings.
   */
  batch?:
    | {
        /** Toggle to enable `eth_call` multicall aggregation. */
        multicall?:
          | boolean
          | {
              /** The maximum size (in bytes) for each calldata chunk. @default 1_024 */
              batchSize?: number | undefined
              /** The maximum number of milliseconds to wait before sending a batch. @default 0 */
              wait?: number | undefined
            }
          | undefined
      }
    | undefined
  /**
   * Time (in ms) that cached data will remain in memory.
   */
  cacheTime: number
  /**
   * [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) configuration.
   * If `false`, the client will not support offchain CCIP lookups.
   */
  ccipRead?:
    | {
        /**
         * A function that will be called to make the offchain CCIP lookup request.
         * @see https://eips.ethereum.org/EIPS/eip-3668#client-lookup-protocol
         */
        request?: (parameters: TODO) => Promise<TODO>
      }
    | false
    | undefined
  /**
   * Chain binded to the Client.
   */
  chain: chain
  /**
   * Frequency (in ms) for polling enabled actions & events. Defaults to 4_000 milliseconds.
   */
  pollingInterval: number
  /**
   * Request function wrapped with friendly error handling.
   */
  request: Transport.RequestFn<rpcSchema>
  /**
   * JSON-RPC transport.
   */
  transport: Transport.TransportValue
  /**
   * A unique ID for the client.
   */
  uid: string
}

type Extended =
  // disallow redefining base properties
  { [_ in keyof Client_internal]?: undefined } & {
    [key: string]: unknown
  }

// Actions that are used internally by other Actions (ie. `call` is used by `readContract`).
// They are allowed to be extended, but must conform to their parameter & return type interfaces.
// Example: an extended `call` action must accept `CallParameters` as parameters,
// and conform to the `CallReturnType` return type.
type ExtendableProtectedActions<
  chain extends Chain | undefined = Chain | undefined,
> = Pick<
  PublicActions<chain>,
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
  Pick<WalletActions<chain>, 'sendTransaction' | 'writeContract'>
