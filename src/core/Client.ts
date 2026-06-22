import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import type * as RpcSchema from 'ox/RpcSchema'

import * as Account from './Account.js'
import type * as Chain from './Chain.js'
import * as Transport from './Transport.js'
import { uid } from './internal/uid.js'
import type { Prettify } from './internal/types.js'

/**
 * A viem Client: the composition root binding a {@link Chain} (config/codecs), a
 * {@link Transport} (wire), and an optional {@link Account} (signer). Extend it
 * with action decorators via `.extend`.
 */
export type Client<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  account extends Account.Account | undefined = Account.Account | undefined,
  transport extends Transport.Transport = Transport.Transport,
  schema extends RpcSchema.Generic = RpcSchema.Default,
  extended extends Extended | undefined = Extended | undefined,
> = Base<chain, account, transport, schema> &
  (extended extends Extended ? extended : unknown) & {
    /** Extends the Client with the bag returned by `fn`. */
    extend: <const fn extends Extended>(
      fn: (client: Client<chain, account, transport, schema, extended>) => fn,
    ) => Client<
      chain,
      account,
      transport,
      schema,
      Prettify<fn> & (extended extends Extended ? extended : unknown)
    >
  }

type Base<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  transport extends Transport.Transport,
  schema extends RpcSchema.Generic,
> = {
  /** The Account of the Client (Actions that need a signer default to it). */
  account: account
  /** `eth_call` multicall aggregation flags. */
  batch?: { multicall?: boolean | MulticallOptions | undefined } | undefined
  /** Default block tag for RPC requests. */
  blockTag?: BlockTag | undefined
  /** Time (in ms) cached data stays in memory. */
  cacheTime: number
  /** [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) config (`false` disables). */
  ccipRead?: CcipReadOptions | false | undefined
  /** Chain for the Client. */
  chain: chain
  /** Data suffix appended to transaction calldata. */
  dataSuffix?: Hex.Hex | undefined
  /** A key for the Client. */
  key: string
  /** A name for the Client. */
  name: string
  /** Polling frequency (ms) for actions & events. */
  pollingInterval: number
  /** Retry/dedupe-wrapped request fn, typed against the resolved `schema`. */
  request: Transport.RequestFn<schema>
  /** The live transport instance. */
  transport: ReturnType<transport['setup']>
  /** The type of Client. */
  type: string
  /** A unique id for the Client. */
  uid: string
}

/** Extensions may add keys but not redefine base keys. */
type Extended = Prettify<
  { [key in keyof Base<any, any, any, any>]?: undefined } & {
    [key: string]: unknown
  }
>

/** A block tag for RPC requests. */
// TODO: replace with the shared block-tag type once the block module lands.
type BlockTag = 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'

/** Options for `eth_call` multicall aggregation. */
export type MulticallOptions = {
  /** Max calldata bytes per chunk. @default 1_024 */
  batchSize?: number | undefined
  /** Enable deployless multicall. */
  deployless?: boolean | undefined
  /** Max ms to wait before sending a batch. @default 0 */
  wait?: number | undefined
}

/** [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) configuration. */
export type CcipReadOptions = {
  /** Makes the offchain CCIP lookup request. */
  request?:
    | ((parameters: {
        data: Hex.Hex
        sender: Address.Address
        urls: readonly string[]
      }) => Promise<Hex.Hex>)
    | undefined
}

/**
 * Creates a {@link Client} from a {@link Transport} and optional {@link Chain}
 * and {@link Account}. `.extend(...)` is the only way to add actions.
 *
 * @example
 * ```ts
 * import { Client, Transport } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: Transport.http(),
 * })
 * ```
 */
export function create<
  chain extends Chain.Chain | undefined = undefined,
  accountOrAddress extends Account.Account | Address.Address | undefined =
    undefined,
  transport extends Transport.Transport = Transport.Transport,
  schema extends RpcSchema.Schema = RpcSchema.Default,
>(
  options: create.Options<chain, accountOrAddress, transport, schema>,
): Client<
  chain,
  accountOrAddress extends Address.Address
    ? Account.JsonRpc<accountOrAddress>
    : accountOrAddress,
  transport,
  RpcSchema.ToGeneric<schema>
>

export function create(options: create.Options): Client {
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
  const pollingInterval =
    options.pollingInterval ??
    Math.min(Math.max(Math.floor(blockTime / 2), 500), 4_000)
  const cacheTime = options.cacheTime ?? pollingInterval

  const account =
    typeof options.account === 'string'
      ? Account.from(options.account)
      : options.account

  const transport = options.transport.setup({
    chain,
    pollingInterval,
    retryCount: options.retryCount,
    timeout: options.timeout,
  })

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
    request: transport.request,
    transport,
    type,
    uid: uid(),
    ...(blockTag ? { blockTag } : {}),
  }

  function extend(base: typeof client) {
    type ExtendFn = (base: typeof client) => Record<string, unknown>
    return (fn: ExtendFn) => {
      const extended = fn(base)
      for (const key in client) delete extended[key]
      const combined = merge(base, extended)
      return Object.assign(combined, {
        extend: extend(combined as typeof base),
      })
    }
  }

  return Object.assign(client, { extend: extend(client) }) as unknown as Client
}

/** Deep-merges decorator namespaces so colliding bags (e.g. `block`) combine. */
function merge(
  base: Record<string, unknown>,
  extended: Record<string, unknown>,
) {
  const result: Record<string, unknown> = { ...base }
  for (const key in extended) {
    const a = result[key]
    const b = extended[key]
    result[key] = isPlainObject(a) && isPlainObject(b) ? merge(a, b) : b
  }
  return result
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

export declare namespace create {
  type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    accountOrAddress extends Account.Account | Address.Address | undefined =
      | Account.Account
      | Address.Address
      | undefined,
    transport extends Transport.Transport = Transport.Transport,
    schema extends RpcSchema.Schema = RpcSchema.Default,
  > = {
    /** The Account (or address) to use for Actions that require a signer. */
    account?: accountOrAddress | undefined
    /** `eth_call` multicall aggregation flags. */
    batch?: { multicall?: boolean | MulticallOptions | undefined } | undefined
    /** Default block tag for RPC requests. */
    blockTag?: BlockTag | undefined
    /** Time (in ms) cached data stays in memory. @default pollingInterval */
    cacheTime?: number | undefined
    /** [CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) config (`false` disables). */
    ccipRead?: CcipReadOptions | false | undefined
    /** Chain for the Client. */
    chain?: chain | undefined
    /** Data suffix appended to transaction calldata. */
    dataSuffix?: Hex.Hex | undefined
    /** A key for the Client. @default 'base' */
    key?: string | undefined
    /** A name for the Client. @default 'Base Client' */
    name?: string | undefined
    /** Polling frequency (ms) for actions & events. */
    pollingInterval?: number | undefined
    /** Per-request retry budget passed through to `transport.setup`. */
    retryCount?: number | undefined
    /** Typed JSON-RPC schema. Accepts an ox `RpcSchema.Generic` or a Zod namespace (`ox/zod`). */
    schema?: schema | undefined
    /** Per-request timeout (ms) passed through to `transport.setup`. */
    timeout?: number | undefined
    /** The transport for the Client. */
    transport: transport
    /** The type of Client. @default 'base' */
    type?: string | undefined
  }

  type ErrorType = Account.from.ErrorType | Errors.GlobalErrorType
}
