import type * as Address from 'ox/Address'
import * as Hex from 'ox/Hex'
import type * as RpcSchema from 'ox/RpcSchema'

import type * as Block from '../utils/Block.js'
import type * as Ccip from '../utils/Ccip.js'
import type * as Account from './Account.js'
import * as Account_module from './Account.js'
import type * as Chain from './Chain.js'
import type * as Transport from './Transport.js'
import type { Prettify } from './internal/types.js'

/** Client used by viem actions. */
export type Client<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  account extends Account.Account | undefined = Account.Account | undefined,
  transport extends Transport.Transport = Transport.Transport,
  schema extends RpcSchema.Generic | undefined = undefined,
  extended extends Record<string, unknown> | undefined =
    | Record<string, unknown>
    | undefined,
> = Prettify<
  Base<chain, account, transport, schema> &
    (extended extends Record<string, unknown> ? extended : {}) & {
      /** Extends the Client with additional action namespaces. */
      extend: <
        const extension extends Extension<chain, account, transport, schema>,
      >(
        decorator: (
          client: Client<chain, account, transport, schema, extended>,
        ) => extension,
      ) => Client<
        chain,
        account,
        transport,
        schema,
        Prettify<
          extension & (extended extends Record<string, unknown> ? extended : {})
        >
      >
    }
>

/** Options for creating a Client. */
export type Options<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  accountOrAddress extends Account.Account | Address.Address | undefined =
    | Account.Account
    | Address.Address
    | undefined,
  transport extends Transport.Transport = Transport.Transport,
  schema extends RpcSchema.Generic | undefined = undefined,
> = {
  /** Account to use for actions that accept a default account. */
  account?: accountOrAddress | Account.Account | Address.Address | undefined
  /** Batch configuration. */
  batch?:
    | {
        /** Multicall batch configuration. */
        multicall?: boolean | MulticallBatchOptions | undefined
      }
    | undefined
  /** Default block tag to use for RPC requests. */
  blockTag?: Block.Tag | undefined
  /**
   * Time in milliseconds that cached data remains in memory.
   *
   * @default pollingInterval
   */
  cacheTime?: number | undefined
  /** CCIP-read configuration. */
  ccipRead?: CcipRead | false | undefined
  /** Chain to use for actions. */
  chain?: chain | Chain.Chain | undefined
  /** Data suffix to append to transaction data. */
  dataSuffix?: Hex.Hex | undefined
  /** Client key. */
  key?: string | undefined
  /** Client display name. */
  name?: string | undefined
  /**
   * Polling interval in milliseconds.
   *
   * @default min(max(floor(chain.blockTime / 2), 500), 4_000)
   */
  pollingInterval?: number | undefined
  /** Typed JSON-RPC schema. */
  rpcSchema?: schema | RpcSchema.Generic | undefined
  /** Transport to use for JSON-RPC requests. */
  transport: transport
  /** Client type metadata. */
  type?: string | undefined
}

/** CCIP-read configuration. */
export type CcipRead = {
  /** Function used to perform CCIP-read gateway requests. */
  request?: (options: Ccip.request.Options) => Promise<Ccip.request.ReturnType>
}

/** Multicall batch options. */
export type MulticallBatchOptions = {
  /**
   * Maximum size in bytes for each calldata chunk.
   *
   * @default 1_024
   */
  batchSize?: number | undefined
  /** Enables deployless multicall. */
  deployless?: boolean | undefined
  /**
   * Maximum milliseconds to wait before sending a batch.
   *
   * @default 0
   */
  wait?: number | undefined
}

type Base<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  account extends Account.Account | undefined = Account.Account | undefined,
  transport extends Transport.Transport = Transport.Transport,
  schema extends RpcSchema.Generic | undefined = undefined,
> = {
  /** Account to use for actions that accept a default account. */
  account: account
  /** Batch configuration. */
  batch?: Options['batch'] | undefined
  /** Default block tag to use for RPC requests. */
  blockTag?: Block.Tag | undefined
  /** Time in milliseconds that cached data remains in memory. */
  cacheTime: number
  /** CCIP-read configuration. */
  ccipRead?: CcipRead | false | undefined
  /** Chain to use for actions. */
  chain: chain
  /** Data suffix to append to transaction data. */
  dataSuffix?: Hex.Hex | undefined
  /** Client key. */
  key: string
  /** Client display name. */
  name: string
  /** Polling interval in milliseconds. */
  pollingInterval: number
  /** JSON-RPC request function. */
  request: Transport.RequestFn<
    schema extends RpcSchema.Generic ? schema : RpcSchema.Default
  >
  /** Concrete transport metadata. */
  transport: ResolvedTransport<transport>
  /** Client type metadata. */
  type: string
  /** Unique client ID. */
  uid: Hex.Hex
}

type Extension<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  transport extends Transport.Transport,
  schema extends RpcSchema.Generic | undefined,
> = Prettify<
  { [key in keyof Base<chain, account, transport, schema>]?: undefined } & {
    [key: string]: unknown
  }
>

type ParseAccount<accountOrAddress> = accountOrAddress extends Address.Address
  ? Account.JsonRpc<accountOrAddress>
  : accountOrAddress extends Account.Account
    ? accountOrAddress
    : undefined

type ResolvedTransport<transport extends Transport.Transport> = Prettify<
  ReturnType<transport>['config'] & TransportValue<ReturnType<transport>>
>

type TransportValue<instance> = instance extends {
  value?: (infer value) | undefined
}
  ? value extends object
    ? value
    : {}
  : {}

type Decorator<base extends object> = (client: base) => Record<string, unknown>

/**
 * Creates a Client.
 *
 * @example
 * ```ts twoslash
 * import { Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http()
 * })
 *
 * const blockNumber = await client.request({
 *   method: 'eth_blockNumber'
 * })
 * // @log: '0x1a2b3c'
 * ```
 *
 * @param options - Client options.
 * @returns Client.
 */
export function create<
  chain extends Chain.Chain | undefined = undefined,
  accountOrAddress extends Account.Account | Address.Address | undefined =
    undefined,
  transport extends Transport.Transport = Transport.Transport,
  schema extends RpcSchema.Generic | undefined = undefined,
>(
  options: Options<chain, accountOrAddress, transport, schema>,
): Client<chain, ParseAccount<accountOrAddress>, transport, schema>
export function create(options: Options): Client {
  const {
    batch,
    ccipRead,
    chain,
    dataSuffix,
    key = 'base',
    name = 'Base Client',
    type = 'base',
  } = options

  const blockTag =
    options.blockTag ??
    (typeof chain?.preconfirmationTime === 'number' ? 'pending' : undefined)
  const blockTime = chain?.blockTime ?? 12_000
  const defaultPollingInterval = Math.min(
    Math.max(Math.floor(blockTime / 2), 500),
    4_000,
  )
  const pollingInterval = options.pollingInterval ?? defaultPollingInterval
  const cacheTime = options.cacheTime ?? pollingInterval
  const account = options.account
    ? Account_module.from(options.account as never)
    : undefined

  const { config, request, value } = options.transport({
    account,
    chain,
    pollingInterval,
  })
  const transport = { ...config, ...(value as Record<string, unknown>) }

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
    uid: Hex.random(32),
    ...(blockTag ? { blockTag } : {}),
  }

  return Object.assign(client, {
    extend: createExtend(client),
  }) as never
}

export declare namespace create {
  type ErrorType = Account.from.ErrorType
}

function createExtend<const base extends object>(base: base): Client['extend'] {
  return ((decorator: Decorator<base>) => {
    const extension = { ...decorator(base as never) }
    for (const key in base) delete extension[key]

    const client = {
      ...base,
      ...extension,
    }
    return Object.assign(client, {
      extend: createExtend(client),
    })
  }) as never
}
