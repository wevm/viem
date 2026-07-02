import type * as Address from 'ox/Address'
import type * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'
import type * as Fee from 'ox/Fee'
import type * as Hex from 'ox/Hex'
import type * as Kzg from 'ox/Kzg'
import type * as Signature from 'ox/Signature'
import type * as Transaction from 'ox/Transaction'
import type * as TransactionReceipt from 'ox/TransactionReceipt'
import type * as TransactionRequest from 'ox/TransactionRequest'
import type * as TxEnvelope from 'ox/TxEnvelope'
import type { z } from 'ox/zod'
import type * as Client from './Client.js'
import { BaseError } from './Errors.js'
import type { Assign, MaybePromise, Prettify } from './internal/types.js'

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
  /** Source chain id (e.g. the L1 chain). */
  sourceId?: number | undefined
  /** Flag for test networks. */
  testnet?: boolean | undefined
  /** Transaction signing & preparation hooks. */
  transaction?: Chain.Transaction | undefined
  /** Hook to verify a signed hash against an address (chains with custom account verification). */
  verifyHash?: Chain.VerifyHash | undefined
}

export declare namespace Chain {
  /** A block explorer for a {@link Chain}. */
  type BlockExplorer = {
    name: string
    url: string
    apiUrl?: string | undefined
  }

  /** Hook to verify a signed hash against an address. */
  type VerifyHash = (
    client: Client.Client,
    options: {
      /** The address that signed the hash. */
      address: Address.Address
      /** The hash that was signed. */
      hash: Hex.Hex
      /** The signature to verify. */
      signature: Hex.Hex
    },
  ) => MaybePromise<boolean>

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
      /**
       * The transaction request. Undefined when the caller is outside of a
       * transaction request context (e.g. a direct call to the
       * `estimateFeesPerGas` Action).
       */
      request?: TransactionRequest.toRpc.Input | undefined
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

  /** Transaction signing & preparation hooks for a {@link Chain}. */
  type Transaction = {
    /**
     * Derives the sign payload (hash) for a transaction envelope.
     *
     * @default `TxEnvelope.getSignPayload`
     */
    getSignPayload?: ((envelope: TxEnvelope.TxEnvelope) => Hex.Hex) | undefined
    /**
     * Hook to prepare a transaction request. Runs while a transaction is
     * prepared (e.g. to inject chain-specific fields). Provide a function to
     * run it at the `'beforeFillTransaction'` phase, or a `[fn, { runAt }]`
     * tuple to select the phase(s).
     */
    prepare?:
      | Transaction.PrepareFn
      | [
          fn: Transaction.PrepareFn,
          options: {
            /** Phases to run the function at. */
            runAt: readonly Transaction.PreparePhase[]
          },
        ]
      | undefined
    /**
     * Serializes a (signed or unsigned) transaction envelope.
     *
     * @default `TxEnvelope.serialize`
     */
    serialize?:
      | ((
          envelope: TxEnvelope.TxEnvelope,
          options?: { signature?: Signature.Signature | undefined } | undefined,
        ) => Hex.Hex)
      | undefined
    /**
     * Converts a transaction request into a (typed) transaction envelope.
     *
     * @default `TransactionRequest.toEnvelope`
     */
    toEnvelope?:
      | ((
          request: TransactionRequest.TransactionRequest,
          options?: { kzg?: Kzg.Kzg | undefined } | undefined,
        ) => MaybePromise<TxEnvelope.TxEnvelope>)
      | undefined
  }

  namespace Transaction {
    /**
     * Hook that prepares an in-flight transaction request for a {@link Chain}.
     * Receives the mutable request (including `chain`) and may return a
     * modified request. Runs at one or more
     * {@link Chain.Transaction.PreparePhase}.
     */
    type PrepareFn = (
      request: Record<string, unknown>,
      context: {
        /** The Client preparing the transaction. */
        client: Client.Client
        /** Phase the hook is running at. */
        phase: PreparePhase
      },
    ) => Promise<Record<string, unknown>> | Record<string, unknown>

    /**
     * Phase a {@link Chain.Transaction.PrepareFn} runs at.
     *
     * - `beforeFillTransaction`: before the request is filled via
     *   `eth_fillTransaction`.
     * - `beforeFillParameters`: before missing parameters are filled.
     * - `afterFillParameters`: after missing parameters are filled.
     */
    type PreparePhase =
      | 'beforeFillTransaction'
      | 'beforeFillParameters'
      | 'afterFillParameters'
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
}

/**
 * Native block type a {@link Chain} produces. Resolves to `z.output` of the
 * chain's `schema.block.fromRpc` codec when declared, otherwise the default
 * {@link Block.Block}.
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
 * default {@link Transaction.Transaction}.
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
 * declared, otherwise the default
 * {@link TransactionReceipt.TransactionReceipt}.
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
 * Native transaction request input a {@link Chain} accepts. Resolves to
 * `z.input` of the chain's `schema.transactionRequest.toRpc` codec when
 * declared, otherwise the default {@link TransactionRequest.toRpc.Input}.
 */
export type ExtractTransactionRequest<chain extends Chain | undefined> =
  chain extends {
    schema: {
      transactionRequest: { toRpc: infer schema extends z.ZodMiniType }
    }
  }
    ? z.input<schema>
    : TransactionRequest.toRpc.Input

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

/** Asserts that the connected chain matches the chain targeted by a request. */
export function assertCurrent({
  chain,
  currentChainId,
}: assertCurrent.Parameters): void {
  if (!chain) throw new NotFoundError()
  if (currentChainId !== chain.id)
    throw new MismatchError({ chain, currentChainId })
}

export declare namespace assertCurrent {
  type Parameters = {
    chain?: Chain | undefined
    currentChainId: number
  }

  type ErrorType = NotFoundError | MismatchError | Errors.GlobalErrorType
}

/** Extracts a chain from a list of chains by id, narrowing the return type. */
export function extract<
  const chains extends readonly Chain[],
  chainId extends chains[number]['id'],
>({
  chains,
  id,
}: extract.Parameters<chains, chainId>): extract.ReturnType<chains, chainId> {
  return chains.find((chain) => chain.id === id) as extract.ReturnType<
    chains,
    chainId
  >
}

export declare namespace extract {
  type Parameters<
    chains extends readonly Chain[],
    chainId extends chains[number]['id'],
  > = {
    chains: chains
    id: chainId | chains[number]['id']
  }

  type ReturnType<
    chains extends readonly Chain[],
    chainId extends chains[number]['id'],
  > = Extract<chains[number], { id: chainId }>

  type ErrorType = Errors.GlobalErrorType
}

/** Resolves a named contract address on a chain (optionally at a block). */
export function getContractAddress({
  blockNumber,
  chain,
  contract: name,
}: {
  blockNumber?: bigint | undefined
  chain: Chain
  contract: string
}) {
  const contract = (chain?.contracts as Record<string, Chain.Contract>)?.[name]
  if (!contract)
    throw new DoesNotSupportContract({
      chain,
      contract: { name },
    })

  if (
    blockNumber &&
    contract.blockCreated &&
    contract.blockCreated > blockNumber
  )
    throw new DoesNotSupportContract({
      blockNumber,
      chain,
      contract: {
        name,
        blockCreated: contract.blockCreated,
      },
    })

  return contract.address
}

export declare namespace getContractAddress {
  type ErrorType = DoesNotSupportContract | Errors.GlobalErrorType
}

export class DoesNotSupportContract extends BaseError {
  override name = 'Chain.DoesNotSupportContract'

  constructor({
    blockNumber,
    chain,
    contract,
  }: {
    blockNumber?: bigint | undefined
    chain: Chain
    contract: { name: string; blockCreated?: number | undefined }
  }) {
    super(
      `Chain "${chain.name}" does not support contract "${contract.name}".`,
      {
        metaMessages: [
          'This could be due to any of the following:',
          ...(blockNumber &&
          contract.blockCreated &&
          contract.blockCreated > blockNumber
            ? [
                `- The contract "${contract.name}" was not deployed until block ${contract.blockCreated} (current block ${blockNumber}).`,
              ]
            : [
                `- The chain does not have the contract "${contract.name}" configured.`,
              ]),
        ],
      },
    )
  }
}

export class MismatchError extends BaseError {
  override name = 'Chain.MismatchError'

  constructor({
    chain,
    currentChainId,
  }: {
    chain: Chain
    currentChainId: number
  }) {
    super(
      `The current chain of the wallet (id: ${currentChainId}) does not match the target chain for the transaction (id: ${chain.id} – ${chain.name}).`,
      {
        metaMessages: [
          `Current Chain ID:  ${currentChainId}`,
          `Expected Chain ID: ${chain.id} – ${chain.name}`,
        ],
      },
    )
  }
}

export class NotFoundError extends BaseError {
  override name = 'Chain.NotFoundError'

  constructor() {
    super(
      [
        'No chain was provided to the request.',
        'Please provide a chain with the `chain` argument on the Action, or by supplying a `chain` to WalletClient.',
      ].join('\n'),
    )
  }
}
