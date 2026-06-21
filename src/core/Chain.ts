import type * as Address from 'ox/Address'
import type * as Block from 'ox/Block'
import type * as Fee from 'ox/Fee'
import type * as Hex from 'ox/Hex'
import type * as Signature from 'ox/Signature'
import type * as Transaction from 'ox/Transaction'
import type * as TransactionReceipt from 'ox/TransactionReceipt'
import type { z } from 'ox/zod'
import type * as Client from './Client.js'
import type { Assign, Prettify } from './internal/types.js'

/** An EVM chain. */
export type Chain = {
  /** Collection of block explorers. */
  blockExplorers?:
    | {
        [key: string]: Chain.BlockExplorer
        default: Chain.BlockExplorer
      }
    | undefined
  /** Block time in milliseconds. */
  blockTime?: number | undefined
  /** Collection of contracts. */
  contracts?: Chain.Contracts | undefined
  /** Collection of ENS TLDs for the chain. */
  ensTlds?: readonly string[] | undefined
  /** Modifies how fees are derived. */
  fees?: Chain.Fees | undefined
  /** Chain id. */
  id: number
  /** Human-readable name. */
  name: string
  /** Currency used by the chain. */
  nativeCurrency: Chain.NativeCurrency
  /** Preconfirmation time in milliseconds. */
  preconfirmationTime?: number | undefined
  /** Collection of RPC endpoints. */
  rpcUrls: {
    [key: string]: Chain.RpcUrls
    default: Chain.RpcUrls
  }
  /** Bidirectional RPC ↔ native codecs. */
  schema?: Chain.Schema | undefined
  /** Transaction serialization overrides. */
  serializers?: Chain.Serializers | undefined
  /** Source chain id (e.g. the L1 chain). */
  sourceId?: number | undefined
  /** Flag for test networks. */
  testnet?: boolean | undefined
}

export declare namespace Chain {
  /** A block explorer for a {@link Chain}. */
  type BlockExplorer = {
    name: string
    url: string
    apiUrl?: string | undefined
  }

  /** A deployed contract on a {@link Chain}. */
  type Contract = {
    address: Address.Address
    blockCreated?: number | undefined
  }

  /** Collection of contracts on a {@link Chain}. */
  type Contracts = Prettify<
    {
      [key: string]:
        | Contract
        | { [sourceId: number]: Contract | undefined }
        | undefined
    } & {
      ensRegistry?: Contract | undefined
      ensUniversalResolver?: Contract | undefined
      multicall3?: Contract | undefined
      erc6492Verifier?: Contract | undefined
    }
  >

  /** Native currency of a {@link Chain}. */
  type NativeCurrency = {
    name: string
    /** 2-6 characters long. */
    symbol: string
    decimals: number
  }

  /** Modifies how fees are derived for a {@link Chain}. */
  type Fees = {
    /**
     * The fee multiplier to use to account for fee fluctuations. Used in the
     * `estimateFeesPerGas` Action.
     *
     * @default 1.2
     */
    baseFeeMultiplier?:
      | number
      | ((args: Fees.FnParameters) => Promise<number> | number)
      | undefined
    /**
     * The default `maxPriorityFeePerGas` to use when a priority fee is not
     * defined upon sending a transaction. Overrides the return value in the
     * `estimateMaxPriorityFeePerGas` Action.
     */
    maxPriorityFeePerGas?: bigint | Fees.MaxPriorityFeePerGasFn | undefined
    /** @deprecated Use `maxPriorityFeePerGas` instead. */
    defaultPriorityFee?: bigint | Fees.MaxPriorityFeePerGasFn | undefined
    /**
     * Allows customization of fee per gas values (e.g.
     * `maxFeePerGas`/`maxPriorityFeePerGas`). Overrides the return value in the
     * `estimateFeesPerGas` Action.
     */
    estimateFeesPerGas?: Fees.EstimateFeesPerGasFn | undefined
  }

  namespace Fees {
    /** Parameters supplied to a {@link Chain.Fees} function. */
    type FnParameters = {
      /** The latest block. */
      block: Block.Block
      /** The Client used to make the request. */
      client: Client.Client
    }

    /** Parameters supplied to a {@link Chain.Fees} `estimateFeesPerGas` function. */
    type EstimateFeesPerGasFnParameters = FnParameters & {
      /** A function to multiply the base fee based on the `baseFeeMultiplier` value. */
      multiply: (x: bigint) => bigint
      /** The type of fees to return. */
      type: Fee.FeeValuesType
    }

    /** A {@link Chain.Fees} `estimateFeesPerGas` function. */
    type EstimateFeesPerGasFn = (
      args: EstimateFeesPerGasFnParameters,
    ) => Promise<Fee.FeeValues | null>

    /** A {@link Chain.Fees} `maxPriorityFeePerGas` function. */
    type MaxPriorityFeePerGasFn = (
      args: FnParameters,
    ) => Promise<bigint | null> | bigint | null
  }

  /** RPC endpoints of a {@link Chain}. */
  type RpcUrls = {
    http: readonly string[]
    webSocket?: readonly string[] | undefined
  }

  /**
   * Per-entity `zod/mini` codecs, split by direction. `fromRpc` decodes an RPC
   * value into its native (viem-side) shape; `toRpc` encodes a native value
   * into its RPC/wire shape.
   */
  type Schema = {
    block?: SchemaCodec | undefined
    transaction?: SchemaCodec | undefined
    transactionReceipt?: SchemaCodec | undefined
    transactionRequest?: SchemaCodec | undefined
  }

  /** RPC ↔ native `zod/mini` codec pair for a chain entity. */
  type SchemaCodec = {
    /** Codec decoding an RPC value into its native shape (via `z.decode`). */
    fromRpc?: z.ZodMiniType | undefined
    /** Codec encoding a native value into its RPC shape (via `z.decode`). */
    toRpc?: z.ZodMiniType | undefined
  }

  /** Transaction serialization overrides. */
  type Serializers = {
    // TODO: infer transaction input from `schema` instead of `any`.
    transaction?:
      | ((
          transaction: any,
          options?: { signature?: Signature.Signature | undefined } | undefined,
        ) => Hex.Hex)
      | undefined
  }
}

/**
 * Native block type a {@link Chain} produces. Resolves to `z.output` of the
 * chain's `schema.block.fromRpc` codec when declared, otherwise the ox default
 * {@link ox#Block.Block}.
 */
export type ExtractBlock<
  chain extends Chain | undefined,
  includeTransactions extends boolean = false,
  blockTag extends Block.Tag = 'latest',
> = chain extends {
  schema: { block: { fromRpc: infer schema extends z.ZodMiniType } }
}
  ? z.output<schema>
  : Block.Block<includeTransactions, blockTag>

/**
 * Native transaction type a {@link Chain} produces. Resolves to `z.output` of
 * the chain's `schema.transaction.fromRpc` codec when declared, otherwise the
 * ox default {@link ox#Transaction.Transaction}.
 */
export type ExtractTransaction<
  chain extends Chain | undefined,
  pending extends boolean = false,
> = chain extends {
  schema: { transaction: { fromRpc: infer schema extends z.ZodMiniType } }
}
  ? z.output<schema>
  : Transaction.Transaction<pending>

/**
 * Native transaction receipt type a {@link Chain} produces. Resolves to
 * `z.output` of the chain's `schema.transactionReceipt.fromRpc` codec when
 * declared, otherwise the ox default
 * {@link ox#TransactionReceipt.TransactionReceipt}.
 */
export type ExtractTransactionReceipt<chain extends Chain | undefined> =
  chain extends {
    schema: {
      transactionReceipt: { fromRpc: infer schema extends z.ZodMiniType }
    }
  }
    ? z.output<schema>
    : TransactionReceipt.TransactionReceipt

/**
 * Defines a {@link Chain}. Preserves the literal type and attaches a
 * chainable `.extend()` for deriving a chain from a base.
 *
 * @example
 * ```ts
 * import { Chain } from 'viem'
 *
 * const mainnet = Chain.from({
 *   id: 1,
 *   name: 'Ethereum',
 *   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
 *   rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
 * })
 * ```
 */
export function from<const chain extends Chain>(
  chain: chain,
): from.ReturnType<chain> {
  return Object.assign(chain, { extend: extend(chain) }) as never
}

export declare namespace from {
  type ReturnType<chain> = Prettify<
    chain & {
      extend: <const extended extends Partial<Chain>>(
        extended: extended,
      ) => from.ReturnType<Assign<chain, extended>>
    }
  >
}

/** Builds the chainable `extend` for a base chain. @internal */
function extend(base: Chain) {
  return (extended: Partial<Chain>) => from({ ...base, ...extended } as Chain)
}
