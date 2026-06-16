import type * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'
import type * as Signature from 'ox/Signature'
import type { z } from 'ox/zod'
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

  /** RPC endpoints of a {@link Chain}. */
  type RpcUrls = {
    http: readonly string[]
    webSocket?: readonly string[] | undefined
  }

  /**
   * Per-entity `zod/mini` codecs. Each entry is a bidirectional codec:
   * `z.input` is the RPC/wire shape, `z.output` is the native (viem-side) shape.
   */
  type Schema = {
    block?: z.ZodMiniType | undefined
    transaction?: z.ZodMiniType | undefined
    transactionReceipt?: z.ZodMiniType | undefined
    transactionRequest?: z.ZodMiniType | undefined
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
