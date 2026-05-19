import type * as Address from 'ox/Address'

import type { Assign, Prettify } from './internal/types.js'

/**
 * Chain definition used by viem clients and actions.
 */
export type Chain<
  formatters extends Formatters | undefined = Formatters | undefined,
  extendSchema extends Record<string, unknown> | undefined =
    | Record<string, unknown>
    | undefined,
> = {
  /** Collection of block explorers. */
  blockExplorers?:
    | {
        [key: string]: BlockExplorer
        default: BlockExplorer
      }
    | undefined
  /** Block time in milliseconds. */
  blockTime?: number | undefined
  /** Collection of contracts. */
  contracts?: Contracts | undefined
  /** Collection of ENS TLDs for the chain. */
  ensTlds?: readonly string[] | undefined
  /** Chain ID as a bigint. */
  id: bigint
  /** Human-readable name. */
  name: string
  /** Currency used by the chain. */
  nativeCurrency: NativeCurrency
  /** Preconfirmation time in milliseconds. */
  preconfirmationTime?: number | undefined
  /** Collection of RPC endpoints. */
  rpcUrls: {
    [key: string]: RpcUrls
    default: RpcUrls
  }
  /** Source chain ID as a bigint. */
  sourceId?: bigint | undefined
  /** Flag for test networks. */
  testnet?: boolean | undefined
} & Config<formatters, extendSchema>

/**
 * Defines a chain.
 */
export function define<const chain extends define.Input>(
  chain: chain,
): define.ReturnType<chain> {
  const chainInstance = {
    formatters: undefined,
    ...chain,
  } as unknown as define.ReturnType<chain>

  return Object.assign(chainInstance, {
    extend: createExtend<define.ReturnType<chain>, InferExtendSchema<chain>>(
      chainInstance,
    ),
  })
}

export declare namespace define {
  /** Chain input accepted by {@link define}. */
  type Input<
    formatters extends Formatters | undefined = Formatters | undefined,
    extendSchema extends Record<string, unknown> | undefined =
      | Record<string, unknown>
      | undefined,
  > = Prettify<Chain<formatters, extendSchema>>

  /** Chain returned by {@link define}. */
  type ReturnType<chain extends Input = Input> = Prettify<
    Assign<
      Chain<InferFormatters<chain>, InferExtendSchema<chain>>,
      Omit<chain, 'id' | 'sourceId'> & {
        id: bigint
      } & ('sourceId' extends keyof chain ? { sourceId: bigint } : {})
    > &
      Extend<
        Assign<
          Chain<InferFormatters<chain>, InferExtendSchema<chain>>,
          Omit<chain, 'id' | 'sourceId'> & {
            id: bigint
          } & ('sourceId' extends keyof chain ? { sourceId: bigint } : {})
        >,
        InferExtendSchema<chain>
      >
  >
}

/**
 * Creates a type marker for chain extension metadata.
 */
export function extendSchema<schema extends Record<string, unknown>>(): schema {
  return {} as schema
}

/** Chain-native currency metadata. */
export type NativeCurrency = {
  /** Currency name. */
  name: string
  /** Currency symbol. */
  symbol: string
  /** Currency decimals. */
  decimals: number
}

/** RPC endpoint collection. */
export type RpcUrls = {
  /** HTTP RPC URLs. */
  http: readonly string[]
  /** WebSocket RPC URLs. */
  webSocket?: readonly string[] | undefined
}

/** Block explorer metadata. */
export type BlockExplorer = {
  /** Explorer name. */
  name: string
  /** Explorer base URL. */
  url: string
  /** Explorer API URL. */
  apiUrl?: string | undefined
}

/** Contract metadata. */
export type Contract = {
  /** Contract address. */
  address: Address.Address
  /** Block where the contract was created. */
  blockCreated?: number | bigint | undefined
}

/** Contract metadata collection. */
export type Contracts = {
  [name: string]:
    | Contract
    | { [sourceId: string]: Contract | undefined }
    | undefined
  ensRegistry?: Contract | undefined
  ensUniversalResolver?: Contract | undefined
  erc6492Verifier?: Contract | undefined
  multicall3?: Contract | undefined
}

/** Chain-specific configuration. */
export type Config<
  formatters extends Formatters | undefined = Formatters | undefined,
  extendSchema extends Record<string, unknown> | undefined =
    | Record<string, unknown>
    | undefined,
> = {
  /** Extend schema for `chain.extend`. */
  extendSchema?: extendSchema | undefined
  /** Chain-specific RPC conversion behavior. */
  formatters?: formatters | undefined
}

/** Chain-specific RPC conversion behavior. */
export type Formatters = {
  /** Block RPC conversion override. */
  block?: Formatter<'block'> | undefined
  /** Transaction RPC conversion override. */
  transaction?: Formatter<'transaction'> | undefined
  /** Transaction receipt RPC conversion override. */
  transactionReceipt?: Formatter<'transactionReceipt'> | undefined
  /** Transaction request RPC conversion override. */
  transactionRequest?: Formatter<'transactionRequest'> | undefined
}

/** Chain-specific RPC conversion entry. */
export type Formatter<type extends string = string> = {
  /** Formatter type. */
  type: type
  /** Converts inbound RPC data into a viem domain object. */
  fromRpc?: ((value: unknown, context?: unknown) => unknown) | undefined
  /** Converts outbound viem domain data into an RPC payload. */
  toRpc?: ((value: unknown, context?: unknown) => unknown) | undefined
}

type InferFormatters<chain extends define.Input> = chain extends {
  formatters?: infer formatters extends Formatters
}
  ? formatters
  : undefined

type InferExtendSchema<chain extends define.Input> = chain extends {
  extendSchema?: infer schema extends Record<string, unknown>
}
  ? schema
  : Record<string, unknown>

type Extend<base, schema> = {
  /** Extends a chain with custom metadata. */
  extend: <const extension extends Extension<base, schema>>(
    extension: extension | ((base: base) => extension),
  ) => Prettify<
    Assign<base, extension> & Extend<Assign<base, extension>, schema>
  >
}

type Extension<base, schema> =
  schema extends Record<string, unknown>
    ? base extends schema
      ? Record<string, unknown>
      : schema
    : Record<string, unknown>

function createExtend<
  const base extends object,
  schema extends Record<string, unknown> | undefined = Record<string, unknown>,
>(base: base): Extend<base, schema>['extend'] {
  return ((fnOrExtension) => {
    const extension =
      typeof fnOrExtension === 'function' ? fnOrExtension(base) : fnOrExtension
    const combined = { ...base, ...extension }
    return Object.assign(combined, { extend: createExtend(combined) })
  }) as Extend<base, schema>['extend']
}
