import type {
  Address,
  Block,
  Errors,
  Fee,
  Hex,
  Kzg,
  Signature,
  Transaction,
  TransactionReceipt,
  TransactionRequest,
} from 'ox'
import type * as Client from './Client.js'
import { BaseError } from './Errors.js'
import type { Assign, MaybePromise, Prettify } from './internal/types.js'
import type * as Token from './Token.js'

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
  /** Typed chain-extension declaration (see {@link extendSchema}). */
  extendSchema?: Record<string, unknown> | undefined
  /** RPC ↔ native converters. */
  codecs?: Chain.Codecs | undefined
  /** Source chain id (e.g. the L1 chain). */
  sourceId?: number | undefined
  /** Whether transaction replacement detection is supported. @default true */
  supportsTransactionReplacementDetection?: boolean | undefined
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
      /** The block hash the verification runs against (EIP-1898). */
      blockHash?: Block.Hash | undefined
      /** The block number the verification runs against. */
      blockNumber?: bigint | undefined
      /** The block tag the verification runs against. */
      blockTag?: Block.Tag | undefined
      /** The hash that was signed. */
      hash: Hex.Hex
      /** Verification mode requested by the caller. */
      mode?: string | undefined
      /** Whether the block hash must belong to the canonical chain. */
      requireCanonical?: boolean | undefined
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

  /**
   * A transaction envelope a {@link Chain}'s hooks operate on. Chains with
   * custom transaction types provide hooks over their own envelope shape
   * (`type` is optional pre-inference on unsigned envelopes).
   */
  type Envelope = { type?: string | undefined }

  /**
   * Transaction signing & preparation hooks for a {@link Chain}.
   *
   * Hook parameters are declared contravariantly (`never`) so chains with
   * custom envelope types (see {@link Envelope}) assign without casts; the
   * envelope flows opaquely from `toEnvelope` into `getSignPayload`/`serialize`.
   */
  type Transaction = {
    /**
     * Derives the sign payload (hash) for a transaction envelope.
     * Return `undefined` to delegate to the default.
     *
     * @default `TxEnvelope.getSignPayload`
     */
    getSignPayload?: ((envelope: never) => Hex.Hex | undefined) | undefined
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
     * Return `undefined` to delegate to the default.
     *
     * @default `TxEnvelope.serialize`
     */
    serialize?:
      | ((
          envelope: never,
          options?: { signature?: Signature.Signature | undefined } | undefined,
        ) => Hex.Hex | undefined)
      | undefined
    /**
     * Converts a transaction request into a (typed) transaction envelope.
     * Return `undefined` to delegate to the default.
     *
     * @default `TransactionRequest.toEnvelope`
     */
    toEnvelope?:
      | ((
          request: TransactionRequest.TransactionRequest,
          options?: { kzg?: Kzg.Kzg | undefined } | undefined,
        ) => MaybePromise<Envelope | undefined>)
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
   * Per-entity RPC ↔ native converters, split by direction. `fromRpc`
   * converts an RPC value into its native (viem-side) shape; `toRpc` converts
   * a native value into its RPC/wire shape.
   */
  type Codecs = {
    block?: Codec | undefined
    transaction?: Codec | undefined
    transactionReceipt?: Codec | undefined
    transactionRequest?: Codec | undefined
  }

  /** RPC ↔ native converter pair for a chain entity. */
  type Codec = {
    /** Converts an RPC value into its native shape. */
    fromRpc?: ((value: any) => unknown) | undefined
    /** Converts a native value into its RPC shape. */
    toRpc?: ((value: any) => unknown) | undefined
  }
}

/**
 * Native block type a {@link Chain} produces. Resolves to the return type of
 * the chain's `codecs.block.fromRpc` converter when declared, otherwise the
 * default {@link Block.Block}.
 */
export type ExtractBlock<
  chain extends Chain | undefined,
  includeTransactions extends boolean = false,
  blockTag extends Block.Tag = 'latest',
> = chain extends {
  codecs: { block: { fromRpc: (value: never) => infer block } }
}
  ? block
  : Block.Block<includeTransactions, blockTag>

/**
 * Native transaction type a {@link Chain} produces. Resolves to the return
 * type of the chain's `codecs.transaction.fromRpc` converter when declared,
 * otherwise the default {@link Transaction.Transaction}.
 */
export type ExtractTransaction<
  chain extends Chain | undefined,
  pending extends boolean = false,
> = chain extends {
  codecs: { transaction: { fromRpc: (value: never) => infer transaction } }
}
  ? transaction
  : Transaction.Transaction<pending>

/**
 * Native transaction receipt type a {@link Chain} produces. Resolves to the
 * return type of the chain's `codecs.transactionReceipt.fromRpc` converter
 * when declared, otherwise the default
 * {@link TransactionReceipt.TransactionReceipt}.
 */
export type ExtractTransactionReceipt<chain extends Chain | undefined> =
  chain extends {
    codecs: {
      transactionReceipt: { fromRpc: (value: never) => infer receipt }
    }
  }
    ? receipt
    : TransactionReceipt.TransactionReceipt

/**
 * Native transaction request input a {@link Chain} accepts. Resolves to the
 * parameter type of the chain's `codecs.transactionRequest.toRpc` converter
 * when declared (the converter's native side), otherwise the default
 * {@link TransactionRequest.toRpc.Input}.
 */
export type ExtractTransactionRequest<chain extends Chain | undefined> =
  chain extends {
    codecs: {
      transactionRequest: { toRpc: (value: infer request) => unknown }
    }
  }
    ? request
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
export function from<const chain extends Chain & Record<string, unknown>>(
  chain: chain,
): from.ReturnType<chain> {
  return Object.assign(chain, { extend: extend(chain) }) as never
}

export declare namespace from {
  type ReturnType<chain> = chain & {
    extend: <const extended extends Partial<Chain> & Record<string, unknown>>(
      extended: extended,
    ) => from.ReturnType<Assign<chain, extended>>
  }
}

/** Builds the chainable `extend` for a base chain. @internal */
function extend(base: Chain) {
  return (extended: Partial<Chain>) => from({ ...base, ...extended } as Chain)
}

/**
 * Declares typed chain-extension properties. Type-only: returns an empty
 * carrier whose type flows through {@link from} so extension fields are typed
 * on the chain root.
 *
 * @example
 * ```ts
 * import { Chain } from 'viem'
 *
 * const chain = Chain.from({
 *   extendSchema: Chain.extendSchema<{ feeToken?: string | undefined }>(),
 *   // ...
 *   feeToken: '0x20c0000000000000000000000000000000000001',
 * })
 * chain.feeToken
 * // ^? string | undefined
 * ```
 */
export function extendSchema<schema extends Record<string, unknown>>(): schema {
  return {} as schema
}

/**
 * Extension record a {@link Chain} declares via {@link extendSchema}
 * (`{}` when the chain declares none).
 */
export type ExtractExtension<chain extends Chain | undefined> = chain extends {
  extendSchema: infer extension extends Record<string, unknown>
}
  ? extension
  : {}

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

/**
 * Filters a chain registry or array by token support, network type, and sort
 * order.
 */
export function filter<const criteria extends filter.Criteria>(
  options: filter.Options<criteria>,
): filter.ReturnType<criteria> {
  const { chains, sort, testnet, token } = options
  const values = Array.isArray(chains) ? chains : Object.values(chains)
  const filtered: Chain[] = []

  for (const chain of values) {
    if (!isChain(chain)) continue
    if (token && !(chain.id in token.addresses)) continue
    if (testnet === true && chain.testnet !== true) continue
    if (testnet === false && chain.testnet === true) continue
    filtered.push(chain)
  }

  if (sort === 'id') filtered.sort((a, b) => a.id - b.id)
  if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name))

  return filtered as filter.ReturnType<criteria>
}

export declare namespace filter {
  /** Chain registry or array accepted by {@link filter}. */
  type Chains = Record<string, unknown> | readonly unknown[]

  /** Criteria accepted by {@link filter}. */
  type Criteria = {
    /** Sort matching chains. */
    sort?: 'id' | 'name' | undefined
    /** Include only testnets (`true`) or mainnets (`false`). */
    testnet?: boolean | undefined
    /** Include only chains with an address for this token. */
    token?: Token.Token | undefined
  }

  /** Options for {@link filter}. */
  type Options<criteria extends Criteria = Criteria> = {
    /** Chain registry or array to filter. */
    chains: Chains
  } & criteria

  /** Return type for {@link filter}. */
  type ReturnType<criteria extends Criteria | undefined> = (Chain &
    TokenConstraint<criteria> &
    TestnetConstraint<criteria>)[]

  /** Token-derived chain-id constraint. */
  type TokenConstraint<criteria extends Criteria | undefined> =
    criteria extends { token: infer token extends Token.Token }
      ? { id: Extract<keyof token['addresses'], number> }
      : unknown

  /** Testnet-derived chain constraint. */
  type TestnetConstraint<criteria extends Criteria | undefined> =
    criteria extends { testnet: infer testnet extends boolean }
      ? testnet extends true
        ? { testnet: true }
        : { testnet?: false | undefined }
      : unknown

  /** Errors thrown by {@link filter}. */
  type ErrorType = Errors.GlobalErrorType
}

function isChain(chain: unknown): chain is Chain {
  return (
    typeof chain === 'object' &&
    chain !== null &&
    'id' in chain &&
    typeof chain.id === 'number' &&
    'name' in chain &&
    typeof chain.name === 'string' &&
    'nativeCurrency' in chain &&
    'rpcUrls' in chain
  )
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
