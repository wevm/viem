import type { Address } from 'abitype'

import type { JsonRpcAccount } from '../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../accounts/utils/parseAccount.js'
import { UrlRequiredError } from '../errors/transport.js'
import type { ErrorType } from '../errors/utils.js'
import type { Account } from '../types/account.js'
import type { BlockTag } from '../types/block.js'
import type { Chain } from '../types/chain.js'
import type { DataSuffix } from '../types/dataSuffix.js'
import type {
  EIP1193RequestFn,
  EIP1474Methods,
  RpcSchema,
} from '../types/eip1193.js'
import type { ExactPartial, Prettify } from '../types/utils.js'
import type {
  CcipRequestParameters,
  CcipRequestReturnType,
} from '../utils/ccip.js'
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
  rpcSchema extends RpcSchema | undefined = undefined,
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
   * Default block tag to use for RPC requests.
   *
   * If the chain supports a pre-confirmation mechanism
   * (set via `chain.experimental_preconfirmationTime`), defaults to `'pending'`.
   *
   * @default 'latest'
   */
  experimental_blockTag?: BlockTag | undefined
  /**
   * Time (in ms) that cached data will remain in memory.
   * @default chain.blockTime / 3
   */
  cacheTime?: number | undefined
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
        request?: (
          parameters: CcipRequestParameters,
        ) => Promise<CcipRequestReturnType>
      }
    | false
    | undefined
  /** Chain for the client. */
  chain?: Chain | undefined | chain
  /** Data suffix to append to transaction data. */
  dataSuffix?: DataSuffix | undefined
  /** A key for the client. */
  key?: string | undefined
  /** A name for the client. */
  name?: string | undefined
  /**
   * Frequency (in ms) for polling enabled actions & events.
   * @default chain.blockTime / 3
   */
  pollingInterval?: number | undefined
  /**
   * Typed JSON-RPC schema for the client.
   */
  rpcSchema?: rpcSchema | undefined
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
  // `chain` is sourced from the slot above (see `ChainFromExtension`), so it is
  // omitted here to avoid intersecting a decorator-supplied default `chain`.
  (extended extends Extended ? Omit<extended, 'chain'> : unknown) & {
    extend: <
      const client extends Extended &
        ExactPartial<ExtendableProtectedActions<transport, chain, account>>,
    >(
      fn: (
        client: Client<transport, chain, account, rpcSchema, extended>,
      ) => client,
    ) => Client<
      transport,
      ChainFromExtension<chain, client>,
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
  /** [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) configuration. */
  ccipRead?: ClientConfig['ccipRead'] | undefined
  /** Chain for the client. */
  chain: chain
  /** Data suffix to append to transaction data. */
  dataSuffix?: DataSuffix | undefined
  /** Default block tag to use for RPC requests. */
  experimental_blockTag?: BlockTag | undefined
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
  // disallow redefining base properties, except `chain` which a decorator
  // may supply as a default when the client was created without one.
  { [_ in Exclude<keyof Client_Base, 'chain'>]?: undefined } & {
    chain?: Chain | undefined
    [key: string]: unknown
  }
>

/**
 * Resolves the `chain` slot for an extended client. A decorator may supply a
 * default `chain` (via the `chain` property on its return value), but only
 * takes effect when the client was created without an explicit chain.
 */
type ChainFromExtension<
  chain extends Chain | undefined,
  extended,
> = [chain] extends [undefined]
  ? extended extends { chain: infer chain_ extends Chain }
    ? chain_
    : chain
  : chain

export type MulticallBatchOptions = {
  /** The maximum size (in bytes) for each calldata chunk. @default 1_024 */
  batchSize?: number | undefined
  /** Enable deployless multicall. */
  deployless?: boolean | undefined
  /** The maximum number of milliseconds to wait before sending a batch. @default 0 */
  wait?: number | undefined
}

export type CreateClientErrorType = ParseAccountErrorType | ErrorType

export function createClient<
  transport extends Transport,
  chain extends Chain | undefined = undefined,
  accountOrAddress extends Account | Address | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
>(
  parameters: ClientConfig<transport, chain, accountOrAddress, rpcSchema>,
): Prettify<
  Client<
    transport,
    chain,
    accountOrAddress extends Address
      ? Prettify<JsonRpcAccount<accountOrAddress>>
      : accountOrAddress,
    rpcSchema
  >
>

export function createClient(parameters: ClientConfig): Client {
  const {
    batch,
    chain,
    ccipRead,
    dataSuffix,
    key = 'base',
    name = 'Base Client',
    type = 'base',
  } = parameters

  const experimental_blockTag =
    parameters.experimental_blockTag ??
    (typeof chain?.experimental_preconfirmationTime === 'number'
      ? 'pending'
      : undefined)
  const blockTime = chain?.blockTime ?? 12_000

  const defaultPollingInterval = Math.min(
    Math.max(Math.floor(blockTime / 2), 500),
    4_000,
  )
  const pollingInterval = parameters.pollingInterval ?? defaultPollingInterval
  const cacheTime = parameters.cacheTime ?? pollingInterval

  const account = parameters.account
    ? parseAccount(parameters.account)
    : undefined

  const resolveTransport = (chain: Chain | undefined) =>
    parameters.transport({
      account,
      chain,
      pollingInterval,
    })

  // A transport (e.g. `http()` without a URL) resolves its RPC URL from the
  // client's `chain` at setup time. When the client was created without a
  // `chain`, a decorator may attach a default one via `extend` (see
  // `ChainFromExtension`). To support that, a `UrlRequiredError` thrown during
  // setup is deferred so the transport can be re-resolved once a chain arrives.
  //
  // The deferred `request` keeps a stable identity but forwards to a mutable
  // target, so action closures created before the chain was attached start
  // working once it is. The map lets a later `extend` resolve a deferred
  // request captured by an earlier one.
  const deferredResolvers = new WeakMap<
    EIP1193RequestFn,
    (chain: Chain) => ReturnType<ClientConfig['transport']>
  >()
  const deferTransport = (
    fallback: EIP1193RequestFn,
  ): ReturnType<ClientConfig['transport']> => {
    let request = fallback
    // Contained cast: `EIP1193RequestFn`'s overloaded generic call signature
    // cannot be expressed by a plain variadic forwarder.
    const deferredRequest = ((...args: any[]) =>
      (request as any)(...args)) as EIP1193RequestFn
    deferredResolvers.set(deferredRequest, (chain) => {
      const resolved = resolveTransport(chain)
      request = resolved.request
      return resolved
    })
    return {
      config: {
        key: 'deferred',
        name: 'Deferred Transport',
        request: deferredRequest,
        type: 'deferred',
      },
      request: deferredRequest,
    }
  }

  const { config, request, value } = (() => {
    try {
      return resolveTransport(chain)
    } catch (error) {
      if (chain === undefined && error instanceof UrlRequiredError)
        return deferTransport(() => {
          throw error
        })
      throw error
    }
  })()
  const transport = { ...config, ...value }

  const client = {
    account,
    batch,
    cacheTime,
    ccipRead,
    chain,
    dataSuffix,
    key,
    name,
    pollingInterval,
    request,
    transport,
    type,
    uid: uid(),
    ...(experimental_blockTag ? { experimental_blockTag } : {}),
  }

  function extend(base: typeof client) {
    type ExtendFn = (base: typeof client) => unknown
    return (extendFn: ExtendFn) => {
      // When extending the root client whose transport was deferred, fork the
      // deferred request so sibling extensions resolve independently.
      const base_ =
        base === client && deferredResolvers.has(base.request)
          ? (() => {
              const { config, request, value } = deferTransport(base.request)
              return { ...base, request, transport: { ...config, ...value } }
            })()
          : base

      const extended = extendFn(base_) as Extended
      for (const key in client) {
        // allow a decorator to supply a default `chain` when the client was
        // created without one.
        if (key === 'chain' && base_.chain === undefined) continue
        delete extended[key]
      }

      // When a decorator attaches a default `chain` to a chainless client whose
      // transport was deferred, re-resolve the transport with that chain.
      const resolve = deferredResolvers.get(base_.request)
      if (resolve && base_.chain === undefined && extended.chain) {
        const { config, request, value } = resolve(extended.chain)
        const combined = {
          ...base_,
          ...extended,
          request,
          transport: { ...config, ...value },
        }
        return Object.assign(combined, { extend: extend(combined as any) })
      }

      const combined = { ...base_, ...extended }
      return Object.assign(combined, { extend: extend(combined as any) })
    }
  }

  return Object.assign(client, { extend: extend(client) as any })
}

/**
 * Defines a typed JSON-RPC schema for the client.
 * Note: This is a runtime noop function.
 */
export function rpcSchema<rpcSchema extends RpcSchema>(): rpcSchema {
  return null as any
}
