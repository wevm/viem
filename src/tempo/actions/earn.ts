import type { Address } from 'abitype'
import { EarnShares, TokenId } from 'ox/tempo'
import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { estimateContractGas } from '../../actions/public/estimateContractGas.js'
import { multicall } from '../../actions/public/multicall.js'
import {
  type ReadContractReturnType,
  readContract,
} from '../../actions/public/readContract.js'
import {
  type SimulateContractReturnType,
  simulateContract,
} from '../../actions/public/simulateContract.js'
import * as internal_Token from '../../actions/token/internal.js'
import {
  type SendTransactionReturnType,
  sendTransaction,
} from '../../actions/wallet/sendTransaction.js'
import { sendTransactionSync } from '../../actions/wallet/sendTransactionSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { Log } from '../../types/log.js'
import type { Compute, OneOf } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import { isAddressEqual } from '../../utils/address/isAddressEqual.js'
import * as Abis from '../Abis.js'
import {
  GetVaultEngineChangedError,
  type GetVaultEngineChangedErrorType,
} from '../errors.js'
import type {
  GetAccountParameter,
  ReadParameters,
  WriteParameters,
  WriteSyncParameters,
} from '../internal/types.js'
import {
  type CallParameters,
  defineCall,
  pickWriteParameters,
  resolveCallParameters,
  resolveTokenWithDecimals,
} from '../internal/utils.js'
import type { TransactionReceipt } from '../Transaction.js'

/**
 * Deposits assets into a vault and mints vault shares to `recipient`. The
 * transaction includes the required asset approval.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.earn.deposit(client, {
 *   amountIn: 100_000_000n,
 *   amountOut: 99_900_000n,
 *   slippageBps: 50,
 *   vault: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function deposit<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: deposit.Parameters<chain, account>,
): Promise<deposit.ReturnValue> {
  return deposit.inner(sendTransaction, client, parameters)
}

export namespace deposit {
  export type Args = {
    /** Assets to deposit; base units or `{ formatted, decimals? }` (asset decimals). */
    amountIn: internal_Token.AmountInput
    /** Vault share recipient. @default `account.address` */
    recipient?: Address | undefined
    /** Vault address. */
    vault: Address
  } & OneOf<
    | {
        /** Minimum vault share output to accept; must be greater than zero. */
        minAmountOut: bigint
      }
    | {
        /** Quoted vault share output; floored by `slippageBps`. */
        amountOut: bigint
        /** Slippage tolerance in basis points under `amountOut` (50 = 0.5%). */
        slippageBps: number
      }
  >
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args
  export type ReturnValue = SendTransactionReturnType
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /** @internal Shared dispatch; reads the asset for the approval. */
  export async function inner<
    action extends typeof sendTransaction | typeof sendTransactionSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: deposit.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const [args, asset] = await Promise.all([
      toDepositArgs(client, parameters as never),
      readContract(client, {
        abi: Abis.vaultAdapter,
        address: parameters.vault,
        functionName: 'asset',
      }),
    ])
    return (await action(client, {
      ...parameters,
      calls: deposit.calls({ ...args, tokenIn: asset }),
    } as never)) as never
  }

  /**
   * Defines a deposit call without an approval. Provide token decimals for
   * formatted inputs and an explicit output bound because this builder performs no reads.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain | undefined>(
    ...parameters: CallParameters<call.Args, Client<Transport, chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { recipient, vault } = args
    const minShares = (() => {
      if (args.minAmountOut !== undefined) return args.minAmountOut
      return EarnShares.minimumOutput(args.amountOut, BigInt(args.slippageBps))
    })()
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'deposit',
      args: [
        internal_Token.toBaseUnits(args.amountIn, undefined),
        recipient,
        minShares,
      ],
    })
  }
  export namespace call {
    export type Args = {
      /** Assets to deposit; base units or `{ formatted, decimals? }` (asset decimals). */
      amountIn: internal_Token.AmountInput
      /** Vault share recipient. */
      recipient: Address
      /** Vault address. */
      vault: Address
    } & OneOf<
      | {
          /** Minimum vault share output to accept. */
          minAmountOut: bigint
        }
      | {
          /** Quoted vault share output; floored by `slippageBps`. */
          amountOut: bigint
          /** Slippage tolerance in basis points under `amountOut` (50 = 0.5%). */
          slippageBps: number
        }
    >
  }

  /**
   * Defines the asset approval and deposit calls for atomic execution. Pass
   * `tokenIn` and token decimals explicitly because this builder performs no reads.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(
    args: call.Args & {
      /** Asset token approved for the deposit. */
      tokenIn: TokenId.TokenIdOrAddress
    },
  ) {
    const { tokenIn, vault } = args
    const amountIn = internal_Token.toBaseUnits(args.amountIn, undefined)
    return [
      defineCall({
        address: TokenId.toAddress(tokenIn),
        abi: Abis.tip20,
        functionName: 'approve',
        args: [vault, amountIn],
      }),
      deposit.call({ ...args, amountIn }),
    ]
  }

  /**
   * Extracts a `Deposited` event from the vault's logs.
   *
   * @param logs - Logs.
   * @param parameters - Parameters.
   * @returns The `Deposited` event.
   */
  export function extractEvent(logs: Log[], parameters: { vault: Address }) {
    const { vault } = parameters
    // Earn contracts are user-deployed: several adapters can emit the same
    // signature in one receipt, so filter by emitting address before decode.
    const [log] = parseEventLogs({
      abi: Abis.vaultAdapter,
      eventName: 'Deposited',
      logs: logs.filter((log) => isAddressEqual(log.address, vault)),
    })
    if (!log) throw new Error('`Deposited` event not found.')
    return log
  }

  /**
   * Estimates gas for a deposit, assuming the vault has enough asset allowance.
   *
   * @param client - Client.
   * @param parameters - Parameters.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: deposit.Parameters<chain, account>,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(parameters as never),
      ...deposit.call(await toDepositArgs(client, parameters as never)),
    } as never)
  }

  /**
   * Simulates a deposit, assuming the vault has enough asset allowance.
   *
   * @param client - Client.
   * @param parameters - Parameters.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: deposit.Parameters<chain, account>,
  ): Promise<SimulateContractReturnType<typeof Abis.vaultAdapter, 'deposit'>> {
    return simulateContract(client, {
      ...pickWriteParameters(parameters as never),
      ...deposit.call(await toDepositArgs(client, parameters as never)),
    } as never) as never
  }
}

/**
 * Deposits assets and returns the confirmed receipt and event data.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions, EarnShares } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const { shares } = await Actions.earn.depositSync(client, {
 *   amountIn: 100_000_000n,
 *   minAmountOut: EarnShares.minimumOutput(99_900_000n, 50n),
 *   vault: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function depositSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: depositSync.Parameters<chain, account>,
): Promise<depositSync.ReturnValue> {
  const { throwOnReceiptRevert = true, vault } = parameters
  const receipt = await deposit.inner(sendTransactionSync, client, {
    ...parameters,
    throwOnReceiptRevert,
  } as never)
  const { args } = deposit.extractEvent(receipt.logs, { vault })
  return {
    amount: args.assets,
    caller: args.caller,
    receipt,
    recipient: args.receiver,
    shares: args.shares,
  }
}

export namespace depositSync {
  export type Args = deposit.Args
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = deposit.Parameters<chain, account> & WriteSyncParameters<chain, account>
  export type ReturnValue = Compute<{
    /** Assets deposited. */
    amount: bigint
    /** Depositing caller. */
    caller: Address
    /** Transaction receipt. */
    receipt: TransactionReceipt
    /** Vault share recipient. */
    recipient: Address
    /** Vault shares minted. */
    shares: bigint
  }>
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Deposits venue shares into a vault and mints vault shares to `recipient`.
 * The transaction includes the required venue share approval.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.earn.depositShares(client, {
 *   amountIn: 500_000_000n,
 *   amountOut: 499_000_000n,
 *   slippageBps: 30,
 *   vault: '0x...',
 *   tokenIn: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function depositShares<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: depositShares.Parameters<chain, account>,
): Promise<depositShares.ReturnValue> {
  return depositShares.inner(sendTransaction, client, parameters)
}

export namespace depositShares {
  export type Args = {
    /** Venue shares to deposit, base units. */
    amountIn: bigint
    /** Vault share recipient. @default `account.address` */
    recipient?: Address | undefined
    /** Vault address. */
    vault: Address
    /** Venue share token approved for the deposit. */
    tokenIn: Address
  } & OneOf<
    | {
        /** Minimum vault share output to accept; must be greater than zero. */
        minAmountOut: bigint
      }
    | {
        /** Quoted vault share output; floored by `slippageBps`. */
        amountOut: bigint
        /** Slippage tolerance in basis points under `amountOut` (50 = 0.5%). */
        slippageBps: number
      }
  >
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args
  export type ReturnValue = SendTransactionReturnType
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /** @internal Shared dispatch; reads the engine for the approval. */
  export async function inner<
    action extends typeof sendTransaction | typeof sendTransactionSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: depositShares.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const engine = await readContract(client, {
      abi: Abis.vaultAdapter,
      address: parameters.vault,
      functionName: 'engine',
    })
    return (await action(client, {
      ...parameters,
      calls: depositShares.calls({
        ...toDepositSharesArgs(client, parameters as never),
        engine,
        tokenIn: parameters.tokenIn,
      }),
    } as never)) as never
  }

  /**
   * Defines a venue share deposit call without an approval. Provide an
   * explicit output bound because this builder performs no reads.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain | undefined>(
    ...parameters: CallParameters<call.Args, Client<Transport, chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { amountIn, recipient, vault } = args
    const minShares = (() => {
      if (args.minAmountOut !== undefined) return args.minAmountOut
      return EarnShares.minimumOutput(args.amountOut, BigInt(args.slippageBps))
    })()
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'depositShares',
      args: [amountIn, recipient, minShares],
    })
  }
  export namespace call {
    export type Args = {
      /** Venue shares to deposit, base units. */
      amountIn: bigint
      /** Vault share recipient. */
      recipient: Address
      /** Vault address. */
      vault: Address
    } & OneOf<
      | {
          /** Minimum vault share output to accept. */
          minAmountOut: bigint
        }
      | {
          /** Quoted vault share output; floored by `slippageBps`. */
          amountOut: bigint
          /** Slippage tolerance in basis points under `amountOut` (50 = 0.5%). */
          slippageBps: number
        }
    >
  }

  /**
   * Defines the venue share approval and deposit calls for atomic execution.
   * Pass the vault's current `engine` and venue share `tokenIn` explicitly.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(
    args: call.Args & {
      /** Current vault engine that pulls the venue shares. */
      engine: Address
      /** Venue share token pulled by the engine. */
      tokenIn: Address
    },
  ) {
    const { amountIn, engine, tokenIn } = args
    return [
      defineCall({
        address: tokenIn,
        abi: Abis.tip20,
        functionName: 'approve',
        args: [engine, amountIn],
      }),
      depositShares.call(args),
    ]
  }

  /**
   * Extracts a `VenueSharesDeposited` event from the vault's logs.
   *
   * @param logs - Logs.
   * @param parameters - Parameters.
   * @returns The `VenueSharesDeposited` event.
   */
  export function extractEvent(logs: Log[], parameters: { vault: Address }) {
    const { vault } = parameters
    // Earn contracts are user-deployed: several adapters can emit the same
    // signature in one receipt, so filter by emitting address before decode.
    const [log] = parseEventLogs({
      abi: Abis.vaultAdapter,
      eventName: 'VenueSharesDeposited',
      logs: logs.filter((log) => isAddressEqual(log.address, vault)),
    })
    if (!log) throw new Error('`VenueSharesDeposited` event not found.')
    return log
  }

  /**
   * Estimates gas for a venue share deposit, assuming enough allowance.
   *
   * @param client - Client.
   * @param parameters - Parameters.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: depositShares.Parameters<chain, account>,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(parameters as never),
      ...depositShares.call(toDepositSharesArgs(client, parameters as never)),
    } as never)
  }

  /**
   * Simulates a venue share deposit, assuming enough allowance.
   *
   * @param client - Client.
   * @param parameters - Parameters.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: depositShares.Parameters<chain, account>,
  ): Promise<
    SimulateContractReturnType<typeof Abis.vaultAdapter, 'depositShares'>
  > {
    return simulateContract(client, {
      ...pickWriteParameters(parameters as never),
      ...depositShares.call(toDepositSharesArgs(client, parameters as never)),
    } as never) as never
  }
}

/**
 * Deposits venue shares and returns the confirmed receipt and event data.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions, EarnShares } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const { earnShares } = await Actions.earn.depositSharesSync(client, {
 *   amountIn: 500_000_000n,
 *   amountOut: 499_000_000n,
 *   slippageBps: 30,
 *   vault: '0x...',
 *   tokenIn: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function depositSharesSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: depositSharesSync.Parameters<chain, account>,
): Promise<depositSharesSync.ReturnValue> {
  const { throwOnReceiptRevert = true, vault } = parameters
  const receipt = await depositShares.inner(sendTransactionSync, client, {
    ...parameters,
    throwOnReceiptRevert,
  } as never)
  const { args } = depositShares.extractEvent(receipt.logs, { vault })
  return {
    caller: args.caller,
    earnShares: args.earnShares,
    receipt,
    receivedVenueShares: args.receivedVenueShares,
    recipient: args.receiver,
    requestedVenueShares: args.requestedVenueShares,
  }
}

export namespace depositSharesSync {
  export type Args = depositShares.Args
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = depositShares.Parameters<chain, account> &
    WriteSyncParameters<chain, account>
  export type ReturnValue = Compute<{
    /** Depositing caller. */
    caller: Address
    /** Vault shares minted. */
    earnShares: bigint
    /** Transaction receipt. */
    receipt: TransactionReceipt
    /** Venue shares measured as received by the engine. */
    receivedVenueShares: bigint
    /** Vault share recipient. */
    recipient: Address
    /** Venue shares requested for pull. */
    requestedVenueShares: bigint
  }>
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Gets the vault's active fee configuration, pending fees, and fee baselines.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const feeState = await Actions.earn.getFeeState(client, {
 *   vault: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The active fee configuration, pending fees, and baselines.
 */
export async function getFeeState<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getFeeState.Parameters,
): Promise<getFeeState.ReturnValue> {
  const { recipient, vault, ...rest } = parameters
  const contracts = [
    defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'currentFeeConfigId',
    }),
    defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'feesActive',
    }),
    defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'highWaterMark',
    }),
    defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'previewAccruedFees',
    }),
    defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'targetBase',
    }),
  ] as const
  // Stored configs are immutable per id, so a follow-up `feeConfig` read stays
  // consistent with the batched id.
  const feeConfig = async (configId: bigint) =>
    toFeeConfig(
      await readContract(client, {
        ...rest,
        abi: Abis.vaultAdapter,
        address: vault,
        functionName: 'feeConfig',
        args: [configId],
      }),
    )
  if (recipient !== undefined) {
    const [configId, feesActive, highWaterMark, preview, targetBase, shares] =
      await multicall(client, {
        ...rest,
        allowFailure: false,
        contracts: [
          ...contracts,
          defineCall({
            address: vault,
            abi: Abis.vaultAdapter,
            functionName: 'claimableFeeShares',
            args: [recipient],
          }),
        ],
        deployless: true,
      })
    return {
      claimableShares: shares,
      config: await feeConfig(configId),
      configId,
      feesActive,
      highWaterMark,
      preview: toFeePreview(preview),
      targetBase,
    }
  }
  const [configId, feesActive, highWaterMark, preview, targetBase] =
    await multicall(client, {
      ...rest,
      allowFailure: false,
      contracts,
      deployless: true,
    })
  return {
    config: await feeConfig(configId),
    configId,
    feesActive,
    highWaterMark,
    preview: toFeePreview(preview),
    targetBase,
  }
}

export namespace getFeeState {
  export type Args = {
    /** Optional fee recipient whose claimable vault shares are included. */
    recipient?: Address | undefined
    /** Vault address. */
    vault: Address
  }
  export type Parameters = Omit<ReadParameters, 'account'> & Args
  export type ReturnValue = {
    /** Claimable fee shares for `recipient`; present when provided. */
    claimableShares?: bigint | undefined
    /** Active fee configuration. */
    config: FeeConfig
    /** Active fee configuration id (starts at `1`). */
    configId: bigint
    /** Whether fees are configured and not emergency-disabled. */
    feesActive: boolean
    /** Post-fee high-water mark per vault share. */
    highWaterMark: bigint
    /** Pending fee amounts. */
    preview: FeePreview
    /** Excess-return fee target per vault share. */
    targetBase: bigint
  }
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/** Vault fee configuration. */
export type FeeConfig = {
  /** Optional excess-return fee over a growing target line. */
  excess: {
    /** Excess fee recipient. */
    account: Address
    /** Annual target growth rate, scaled to 18 decimals. */
    annualTargetRate: bigint
    /** Whether the excess fee is active. */
    enabled: boolean
    /** Rate applied above the target, scaled to 18 decimals. */
    excessFeeRate: bigint
  }
  /** Fixed fee recipients and their 18-decimal rates. */
  fixedFees: readonly { account: Address; rate: bigint }[]
}

/** Pending vault fee amounts. */
export type FeePreview = {
  /** Assets backing active vault shares. */
  activeAssets: bigint
  /** Fee allocations in assets and vault shares. */
  allocations: readonly {
    account: Address
    feeAssets: bigint
    feeShares: bigint
  }[]
  /** Excess-return fee portion, asset units. */
  excessFeeAssets: bigint
  /** Fixed fee portion, asset units. */
  fixedFeeAssets: bigint
  /** Accrual above the high-water mark, asset units. */
  positiveAccrualAssets: bigint
  /** Scaled asset value per vault share after fees. */
  postFeeValuePerShare: bigint
  /** Scaled asset value per vault share before fees. */
  preFeeValuePerShare: bigint
  /** Scaled excess-fee target per vault share. */
  targetValuePerShare: bigint
  /** Total fee liability, asset units. */
  totalFeeAssets: bigint
  /** Vault shares minted to cover the total fee. */
  totalFeeShares: bigint
}

/**
 * Gets an account's asset and vault share balances, allowances, and current
 * share value. The value includes fees.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const position = await Actions.earn.getPosition(client, {
 *   account: '0x...',
 *   vault: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The asset and vault share balances, allowances, and value.
 */
export async function getPosition<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getPosition.Parameters<account>,
): Promise<getPosition.ReturnValue> {
  const { account: account_ = client.account, vault, ...rest } = parameters
  if (!account_) throw new AccountNotFoundError()
  const account = parseAccount(account_).address
  const [asset, shareToken] = await multicall(client, {
    ...rest,
    allowFailure: false,
    contracts: [
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'asset',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'shareToken',
      }),
    ],
    deployless: true,
  })
  const [assetAllowance, assetBalance, shareAllowance, shareBalance] =
    await multicall(client, {
      ...rest,
      allowFailure: false,
      contracts: [
        defineCall({
          address: asset,
          abi: Abis.tip20,
          functionName: 'allowance',
          args: [account, vault],
        }),
        defineCall({
          address: asset,
          abi: Abis.tip20,
          functionName: 'balanceOf',
          args: [account],
        }),
        defineCall({
          address: shareToken,
          abi: Abis.tip20,
          functionName: 'allowance',
          args: [account, vault],
        }),
        defineCall({
          address: shareToken,
          abi: Abis.tip20,
          functionName: 'balanceOf',
          args: [account],
        }),
      ],
      deployless: true,
    })
  const value = await readContract(client, {
    ...rest,
    abi: Abis.vaultAdapter,
    address: vault,
    args: [shareBalance],
    functionName: 'previewRedeem',
  })
  return {
    asset,
    assetAllowance,
    assetBalance,
    shareAllowance,
    shareBalance,
    shareToken,
    value,
  }
}

export namespace getPosition {
  export type Args<account extends Account | undefined = Account | undefined> =
    GetAccountParameter<account> & {
      /** Vault address. */
      vault: Address
    }
  export type Parameters<
    account extends Account | undefined = Account | undefined,
  > = Omit<ReadParameters, 'account'> & Args<account>
  export type ReturnValue = {
    /** Asset accepted by the vault. */
    asset: Address
    /** Assets the vault may spend from the account. */
    assetAllowance: bigint
    /** Asset balance held by the account. */
    assetBalance: bigint
    /** Vault shares the vault may spend from the account. */
    shareAllowance: bigint
    /** Vault share balance held by the account. */
    shareBalance: bigint
    /** Token representing vault shares. */
    shareToken: Address
    /** Current asset value of the vault share balance, including fees. */
    value: bigint
  }
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Gets the asset output for an exact vault share input, including fees.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const amountOut = await Actions.earn.getRedeemQuote(client, {
 *   amountIn: 100_000_000n,
 *   vault: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The asset output, including fees.
 */
export async function getRedeemQuote<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getRedeemQuote.Parameters,
): Promise<getRedeemQuote.ReturnValue> {
  const { amountIn, vault, ...rest } = parameters
  return readContract(client, {
    ...rest,
    abi: Abis.vaultAdapter,
    address: vault,
    args: [amountIn],
    functionName: 'previewRedeem',
  })
}

export namespace getRedeemQuote {
  export type Args = {
    /** Exact vault share input, base units. */
    amountIn: bigint
    /** Vault address. */
    vault: Address
  }
  export type Parameters = Omit<ReadParameters, 'account'> & Args
  /** Asset output, including fees. */
  export type ReturnValue = bigint
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Gets the vault's addresses, configuration, accounting state, and supported
 * actions. Throws {@link GetVaultEngineChangedError} if its engine changes mid-read.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const vault = await Actions.earn.getVault(client, {
 *   vault: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The vault state and metadata.
 */
export async function getVault<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getVault.Parameters,
): Promise<getVault.ReturnValue> {
  const { vault, ...rest } = parameters
  const engine = await readContract(client, {
    ...rest,
    abi: Abis.vaultAdapter,
    address: vault,
    functionName: 'engine',
  })
  const [
    asset,
    engine_,
    shareToken,
    operator,
    emergencyGuardian,
    asyncJanitor,
    engineMigrationMode,
    depositsPaused,
    engineShares,
    shareSupply,
    isSynced,
    pendingRedeemCount,
    feesActive,
    totalAssets,
    name,
    symbol,
    asyncRedeem,
    exactWithdraw,
    inKindDeposit,
    syncRedeem,
  ] = await multicall(client, {
    ...rest,
    allowFailure: false,
    contracts: getVault.calls({ engine, vault }),
    deployless: true,
  })
  if (!isAddressEqual(engine, engine_))
    throw new GetVaultEngineChangedError({ vault })
  return {
    asset,
    asyncJanitor,
    capabilities: { asyncRedeem, exactWithdraw, inKindDeposit, syncRedeem },
    depositsPaused,
    emergencyGuardian,
    engine: { address: engine_, name, symbol, totalAssets },
    // `EngineMigrationMode`: 0 = UserOnly, 1 = OperatorEnabled.
    engineMigrationMode:
      engineMigrationMode === 0 ? 'userOnly' : 'operatorEnabled',
    engineShares,
    feesActive,
    isSynced,
    operator,
    pendingRedeemCount,
    shareSupply,
    shareToken,
  }
}

export namespace getVault {
  export type Args = {
    /** Vault address. */
    vault: Address
  }
  export type Parameters = Omit<ReadParameters, 'account'> & Args
  export type ReturnValue = {
    /** Asset accepted by the vault. */
    asset: Address
    /** Address allowed to cancel queued redemptions; zero when disabled. */
    asyncJanitor: Address
    /** Actions supported by the current venue integration. */
    capabilities: {
      /** Queued redemptions. */
      asyncRedeem: boolean
      /** Exact asset withdrawals. */
      exactWithdraw: boolean
      /** Venue share deposits. */
      inKindDeposit: boolean
      /** Immediate redemptions. */
      syncRedeem: boolean
    }
    /** Whether new deposits are paused. */
    depositsPaused: boolean
    /** Address allowed to pause deposits; zero when disabled. */
    emergencyGuardian: Address
    /** Current venue integration. */
    engine: {
      /** Integration address. */
      address: Address
      /** Engine display name. */
      name: string
      /** Engine display symbol. */
      symbol: string
      /** Asset value of the active backing. */
      totalAssets: bigint
    }
    /** Whether only users may change the venue integration. */
    engineMigrationMode: 'operatorEnabled' | 'userOnly'
    /** Venue shares held for the vault. */
    engineShares: bigint
    /** Whether fees are configured and not emergency-disabled. */
    feesActive: boolean
    /** Whether vault share supply matches its asset backing. */
    isSynced: boolean
    /** Vault governance address. */
    operator: Address
    /** Open queued redemptions. */
    pendingRedeemCount: bigint
    /** Active vault share supply. */
    shareSupply: bigint
    /** Token representing vault shares. */
    shareToken: Address
  }
  // TODO: exhaustive error type
  export type ErrorType = GetVaultEngineChangedErrorType | BaseErrorType

  /**
   * Defines the reads used by {@link getVault}. Pass the vault's current
   * engine address.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(args: Args & { engine: Address }) {
    const { engine, vault } = args
    return [
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'asset',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'engine',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'shareToken',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'operator',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'emergencyGuardian',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'asyncJanitor',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'engineMigrationMode',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'depositsPaused',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'engineShares',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'shareSupply',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'isSynced',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'pendingRedeemCount',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'feesActive',
      }),
      defineCall({
        address: engine,
        abi: Abis.vaultEngine,
        functionName: 'totalAssets',
      }),
      defineCall({
        address: engine,
        abi: Abis.vaultEngine,
        functionName: 'name',
      }),
      defineCall({
        address: engine,
        abi: Abis.vaultEngine,
        functionName: 'symbol',
      }),
      defineCall({
        address: engine,
        abi: Abis.vaultEngine,
        functionName: 'supportsInterface',
        args: [interfaceIds.asyncRedeem],
      }),
      defineCall({
        address: engine,
        abi: Abis.vaultEngine,
        functionName: 'supportsInterface',
        args: [interfaceIds.exactWithdraw],
      }),
      defineCall({
        address: engine,
        abi: Abis.vaultEngine,
        functionName: 'supportsInterface',
        args: [interfaceIds.inKindDeposit],
      }),
      defineCall({
        address: engine,
        abi: Abis.vaultEngine,
        functionName: 'supportsInterface',
        args: [interfaceIds.syncRedeem],
      }),
    ] as const
  }
}

/**
 * Gets the vault shares required for an exact asset output, including fees
 * and ceiling rounding.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const amountIn = await Actions.earn.getWithdrawQuote(client, {
 *   amountOut: 250_000_000n,
 *   vault: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The required vault share input, ceiling-rounded.
 */
export async function getWithdrawQuote<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getWithdrawQuote.Parameters,
): Promise<getWithdrawQuote.ReturnValue> {
  const { amountOut, vault, ...rest } = parameters
  return readContract(client, {
    ...rest,
    abi: Abis.vaultAdapter,
    address: vault,
    args: [amountOut],
    functionName: 'previewWithdraw',
  })
}

export namespace getWithdrawQuote {
  export type Args = {
    /** Exact asset output, base units. */
    amountOut: bigint
    /** Vault address. */
    vault: Address
  }
  export type Parameters = Omit<ReadParameters, 'account'> & Args
  /** Required vault share input, ceiling-rounded. */
  export type ReturnValue = bigint
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Redeems vault shares for assets sent to `recipient`. The transaction
 * includes the required vault share approval.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.earn.redeem(client, {
 *   amountIn: 100_000_000n,
 *   slippageBps: 50,
 *   vault: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function redeem<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: redeem.Parameters<chain, account>,
): Promise<redeem.ReturnValue> {
  return redeem.inner(sendTransaction, client, parameters)
}

export namespace redeem {
  export type Args = {
    /** Vault shares to redeem; base units or `{ formatted, decimals? }`. */
    amountIn: internal_Token.AmountInput
    /** Asset recipient. @default `account.address` */
    recipient?: Address | undefined
    /** Vault address. */
    vault: Address
  } & OneOf<
    | {
        /** Minimum asset output to accept; must be greater than zero. */
        minAmountOut: bigint
      }
    | {
        /** Slippage tolerance in basis points under a live {@link getRedeemQuote} (50 = 0.5%). */
        slippageBps: number
      }
    | {
        /** Quoted asset output; floored by `slippageBps`. */
        amountOut: bigint
        /** Slippage tolerance in basis points under `amountOut` (50 = 0.5%). */
        slippageBps: number
      }
  >
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args
  export type ReturnValue = SendTransactionReturnType
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /** @internal Shared dispatch; reads the vault share token for the approval. */
  export async function inner<
    action extends typeof sendTransaction | typeof sendTransactionSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: redeem.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const [args, shareToken] = await Promise.all([
      toRedeemArgs(client, parameters as never),
      readContract(client, {
        abi: Abis.vaultAdapter,
        address: parameters.vault,
        functionName: 'shareToken',
      }),
    ])
    return (await action(client, {
      ...parameters,
      calls: redeem.calls({ ...args, tokenIn: shareToken }),
    } as never)) as never
  }

  /**
   * Defines a redeem call without an approval. Provide vault share decimals
   * for formatted inputs and an explicit output bound because this builder performs no reads.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain | undefined>(
    ...parameters: CallParameters<call.Args, Client<Transport, chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { recipient, vault } = args
    const minAssets = (() => {
      if (args.minAmountOut !== undefined) return args.minAmountOut
      return EarnShares.minimumOutput(args.amountOut, BigInt(args.slippageBps))
    })()
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'redeem',
      args: [
        internal_Token.toBaseUnits(args.amountIn, undefined),
        recipient,
        minAssets,
      ],
    })
  }
  export namespace call {
    export type Args = {
      /** Vault shares to redeem; base units or `{ formatted, decimals? }`. */
      amountIn: internal_Token.AmountInput
      /** Asset recipient. */
      recipient: Address
      /** Vault address. */
      vault: Address
    } & OneOf<
      | {
          /** Minimum asset output to accept. */
          minAmountOut: bigint
        }
      | {
          /** Quoted asset output; floored by `slippageBps`. */
          amountOut: bigint
          /** Slippage tolerance in basis points under `amountOut` (50 = 0.5%). */
          slippageBps: number
        }
    >
  }

  /**
   * Defines the vault share approval and redeem calls for atomic execution.
   * Pass the vault share `tokenIn` explicitly because this builder performs no reads.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(
    args: call.Args & {
      /** Vault share token approved for the redemption. */
      tokenIn: Address
    },
  ) {
    const { tokenIn, vault } = args
    const amountIn = internal_Token.toBaseUnits(args.amountIn, undefined)
    return [
      defineCall({
        address: tokenIn,
        abi: Abis.tip20,
        functionName: 'approve',
        args: [vault, amountIn],
      }),
      redeem.call({ ...args, amountIn }),
    ]
  }

  /**
   * Extracts a `Redeemed` event from the vault's logs.
   *
   * @param logs - Logs.
   * @param parameters - Parameters.
   * @returns The `Redeemed` event.
   */
  export function extractEvent(logs: Log[], parameters: { vault: Address }) {
    const { vault } = parameters
    // Earn contracts are user-deployed: several adapters can emit the same
    // signature in one receipt, so filter by emitting address before decode.
    const [log] = parseEventLogs({
      abi: Abis.vaultAdapter,
      eventName: 'Redeemed',
      logs: logs.filter((log) => isAddressEqual(log.address, vault)),
    })
    if (!log) throw new Error('`Redeemed` event not found.')
    return log
  }

  /**
   * Estimates gas for a redemption, assuming enough vault share allowance.
   *
   * @param client - Client.
   * @param parameters - Parameters.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: redeem.Parameters<chain, account>,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(parameters as never),
      ...redeem.call(await toRedeemArgs(client, parameters as never)),
    } as never)
  }

  /**
   * Simulates a redemption, assuming enough vault share allowance.
   *
   * @param client - Client.
   * @param parameters - Parameters.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: redeem.Parameters<chain, account>,
  ): Promise<SimulateContractReturnType<typeof Abis.vaultAdapter, 'redeem'>> {
    return simulateContract(client, {
      ...pickWriteParameters(parameters as never),
      ...redeem.call(await toRedeemArgs(client, parameters as never)),
    } as never) as never
  }
}

/**
 * Redeems vault shares and returns the confirmed receipt and event data.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const { amount } = await Actions.earn.redeemSync(client, {
 *   amountIn: 100_000_000n,
 *   minAmountOut: 99_500_000n,
 *   vault: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function redeemSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: redeemSync.Parameters<chain, account>,
): Promise<redeemSync.ReturnValue> {
  const { throwOnReceiptRevert = true, vault } = parameters
  const receipt = await redeem.inner(sendTransactionSync, client, {
    ...parameters,
    throwOnReceiptRevert,
  } as never)
  const { args } = redeem.extractEvent(receipt.logs, { vault })
  return {
    amount: args.assets,
    caller: args.caller,
    receipt,
    recipient: args.receiver,
    shares: args.shares,
  }
}

export namespace redeemSync {
  export type Args = redeem.Args
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = redeem.Parameters<chain, account> & WriteSyncParameters<chain, account>
  export type ReturnValue = Compute<{
    /** Assets paid out. */
    amount: bigint
    /** Redeeming caller. */
    caller: Address
    /** Transaction receipt. */
    receipt: TransactionReceipt
    /** Asset recipient. */
    recipient: Address
    /** Vault shares burned. */
    shares: bigint
  }>
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Withdraws an exact asset amount to `recipient`, up to the specified vault
 * share limit. The transaction includes the required vault share approval;
 * use {@link redeem} for a full exit.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.earn.withdrawExact(client, {
 *   amountOut: 40_000_000n,
 *   slippageBps: 50,
 *   vault: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function withdrawExact<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: withdrawExact.Parameters<chain, account>,
): Promise<withdrawExact.ReturnValue> {
  return withdrawExact.inner(sendTransaction, client, parameters)
}

export namespace withdrawExact {
  export type Args = {
    /** Exact assets to receive; base units or `{ formatted, decimals? }`. */
    amountOut: internal_Token.AmountInput
    /** Asset recipient. @default `account.address` */
    recipient?: Address | undefined
    /** Vault address. */
    vault: Address
  } & OneOf<
    | {
        /** Maximum vault share input to burn. */
        maxAmountIn: bigint
      }
    | {
        /** Slippage headroom above a live {@link getWithdrawQuote}, ceiling-rounded (50 = 0.5%). */
        slippageBps: number
      }
    | {
        /** Quoted vault share input; raised by `slippageBps`. */
        amountIn: bigint
        /** Slippage tolerance in basis points over `amountIn` (50 = 0.5%). */
        slippageBps: number
      }
  >
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args
  export type ReturnValue = SendTransactionReturnType
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /** @internal Shared dispatch; reads the vault share token for the approval. */
  export async function inner<
    action extends typeof sendTransaction | typeof sendTransactionSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: withdrawExact.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const [args, shareToken] = await Promise.all([
      toWithdrawExactArgs(client, parameters as never),
      readContract(client, {
        abi: Abis.vaultAdapter,
        address: parameters.vault,
        functionName: 'shareToken',
      }),
    ])
    return (await action(client, {
      ...parameters,
      calls: withdrawExact.calls({ ...args, tokenIn: shareToken }),
    } as never)) as never
  }

  /**
   * Defines an exact withdrawal call without an approval. Provide asset
   * decimals and an explicit input limit because this builder performs no reads.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain | undefined>(
    ...parameters: CallParameters<call.Args, Client<Transport, chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { recipient, vault } = args
    const maxShares = (() => {
      if (args.maxAmountIn !== undefined) return args.maxAmountIn
      return maximumInput(args.amountIn, args.slippageBps)
    })()
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'withdrawExact',
      args: [
        internal_Token.toBaseUnits(args.amountOut, undefined),
        recipient,
        maxShares,
      ],
    })
  }
  export namespace call {
    export type Args = {
      /** Exact assets to receive; base units or `{ formatted, decimals? }`. */
      amountOut: internal_Token.AmountInput
      /** Asset recipient. */
      recipient: Address
      /** Vault address. */
      vault: Address
    } & OneOf<
      | {
          /** Maximum vault share input to burn. */
          maxAmountIn: bigint
        }
      | {
          /** Quoted vault share input; raised by `slippageBps`. */
          amountIn: bigint
          /** Slippage tolerance in basis points over `amountIn` (50 = 0.5%). */
          slippageBps: number
        }
    >
  }

  /**
   * Defines the vault share approval and withdrawal calls for atomic
   * execution. Pass the vault share `tokenIn` explicitly because this builder performs no reads.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(
    args: call.Args & {
      /** Vault share token approved for the withdrawal. */
      tokenIn: Address
    },
  ) {
    const { tokenIn, vault } = args
    const amountOut = internal_Token.toBaseUnits(args.amountOut, undefined)
    const call = withdrawExact.call({ ...args, amountOut })
    const [, , maxShares] = call.args
    return [
      defineCall({
        address: tokenIn,
        abi: Abis.tip20,
        functionName: 'approve',
        args: [vault, maxShares],
      }),
      call,
    ]
  }

  /**
   * Extracts a `WithdrewExact` event from the vault's logs.
   *
   * @param logs - Logs.
   * @param parameters - Parameters.
   * @returns The `WithdrewExact` event.
   */
  export function extractEvent(logs: Log[], parameters: { vault: Address }) {
    const { vault } = parameters
    // Earn contracts are user-deployed: several adapters can emit the same
    // signature in one receipt, so filter by emitting address before decode.
    const [log] = parseEventLogs({
      abi: Abis.vaultAdapter,
      eventName: 'WithdrewExact',
      logs: logs.filter((log) => isAddressEqual(log.address, vault)),
    })
    if (!log) throw new Error('`WithdrewExact` event not found.')
    return log
  }

  /**
   * Estimates gas for an exact withdrawal, assuming enough vault share allowance.
   *
   * @param client - Client.
   * @param parameters - Parameters.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: withdrawExact.Parameters<chain, account>,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(parameters as never),
      ...withdrawExact.call(
        await toWithdrawExactArgs(client, parameters as never),
      ),
    } as never)
  }

  /**
   * Simulates an exact withdrawal, assuming enough vault share allowance.
   *
   * @param client - Client.
   * @param parameters - Parameters.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: withdrawExact.Parameters<chain, account>,
  ): Promise<
    SimulateContractReturnType<typeof Abis.vaultAdapter, 'withdrawExact'>
  > {
    return simulateContract(client, {
      ...pickWriteParameters(parameters as never),
      ...withdrawExact.call(
        await toWithdrawExactArgs(client, parameters as never),
      ),
    } as never) as never
  }
}

/**
 * Withdraws an exact asset amount and returns the confirmed receipt and event data.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const { sharesBurned } = await Actions.earn.withdrawExactSync(client, {
 *   amountOut: 40_000_000n,
 *   maxAmountIn: 40_200_000n,
 *   vault: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function withdrawExactSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: withdrawExactSync.Parameters<chain, account>,
): Promise<withdrawExactSync.ReturnValue> {
  const { throwOnReceiptRevert = true, vault } = parameters
  const receipt = await withdrawExact.inner(sendTransactionSync, client, {
    ...parameters,
    throwOnReceiptRevert,
  } as never)
  const { args } = withdrawExact.extractEvent(receipt.logs, { vault })
  return {
    amount: args.assets,
    caller: args.caller,
    receipt,
    recipient: args.receiver,
    sharesBurned: args.sharesBurned,
  }
}

export namespace withdrawExactSync {
  export type Args = withdrawExact.Args
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = withdrawExact.Parameters<chain, account> &
    WriteSyncParameters<chain, account>
  export type ReturnValue = Compute<{
    /** Exact assets received. */
    amount: bigint
    /** Withdrawing caller. */
    caller: Address
    /** Transaction receipt. */
    receipt: TransactionReceipt
    /** Asset recipient. */
    recipient: Address
    /** Vault shares burned. */
    sharesBurned: bigint
  }>
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

// ERC-165 ids of the optional engine capability interfaces (XOR of each
// interface's function selectors).
const interfaceIds = {
  /** `IVaultEngineAsync`. */
  asyncRedeem: '0xa1a6a1d7',
  /** `IVaultEngineExactWithdraw`. */
  exactWithdraw: '0x0adfb0b9',
  /** `IVaultEngineShares`. */
  inKindDeposit: '0x7d28a2f2',
  /** `IVaultEngineSync`. */
  syncRedeem: '0x370457f4',
} as const

/** Trims the decoded `IVaultFees.FeeConfig` to its active fixed-fee count. */
function toFeeConfig(
  config: ReadContractReturnType<typeof Abis.vaultAdapter, 'feeConfig'>,
): FeeConfig {
  return {
    excess: config.excess,
    fixedFees: config.fixedFees.slice(0, config.fixedFeeCount),
  }
}

/** Trims the decoded `IVaultFees.FeePreview` to its active allocation count. */
function toFeePreview(
  preview: ReadContractReturnType<
    typeof Abis.vaultAdapter,
    'previewAccruedFees'
  >,
): FeePreview {
  const { allocationCount, allocations, ...rest } = preview
  return { ...rest, allocations: allocations.slice(0, allocationCount) }
}

/** Resolves `deposit` parameters into the adapter call args. @internal */
async function toDepositArgs(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: deposit.Parameters,
): Promise<deposit.call.Args> {
  const { vault } = parameters
  const amountIn = await toBaseUnitsLive(client, {
    amount: parameters.amountIn,
    token: 'asset',
    vault,
  })
  const args = {
    amountIn,
    recipient: resolveRecipient(client, parameters),
    vault,
  }
  if (parameters.minAmountOut !== undefined)
    return { ...args, minAmountOut: parameters.minAmountOut }
  return {
    ...args,
    amountOut: parameters.amountOut,
    slippageBps: parameters.slippageBps,
  }
}

/** Resolves `depositShares` parameters into the adapter call args. @internal */
function toDepositSharesArgs(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: depositShares.Parameters,
): depositShares.call.Args {
  const { amountIn, vault } = parameters
  const args = {
    amountIn,
    recipient: resolveRecipient(client, parameters),
    vault,
  }
  if (parameters.minAmountOut !== undefined)
    return { ...args, minAmountOut: parameters.minAmountOut }
  return {
    ...args,
    amountOut: parameters.amountOut,
    slippageBps: parameters.slippageBps,
  }
}

/** Resolves `redeem` parameters into the adapter call args. @internal */
async function toRedeemArgs(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: redeem.Parameters,
): Promise<redeem.call.Args> {
  const { vault } = parameters
  const amountIn = await toBaseUnitsLive(client, {
    amount: parameters.amountIn,
    token: 'shareToken',
    vault,
  })
  const args = {
    amountIn,
    recipient: resolveRecipient(client, parameters),
    vault,
  }
  if (parameters.minAmountOut !== undefined)
    return { ...args, minAmountOut: parameters.minAmountOut }
  const amountOut = await (async () => {
    if (parameters.amountOut !== undefined) return parameters.amountOut
    return getRedeemQuote(client, { amountIn, vault })
  })()
  return {
    ...args,
    amountOut,
    slippageBps: parameters.slippageBps,
  }
}

/** Resolves `withdrawExact` parameters into the adapter call args. @internal */
async function toWithdrawExactArgs(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: withdrawExact.Parameters,
): Promise<withdrawExact.call.Args> {
  const { vault } = parameters
  const amountOut = await toBaseUnitsLive(client, {
    amount: parameters.amountOut,
    token: 'asset',
    vault,
  })
  const args = {
    amountOut,
    recipient: resolveRecipient(client, parameters),
    vault,
  }
  if (parameters.maxAmountIn !== undefined)
    return { ...args, maxAmountIn: parameters.maxAmountIn }
  const amountIn = await (async () => {
    if (parameters.amountIn !== undefined) return parameters.amountIn
    return getWithdrawQuote(client, { amountOut, vault })
  })()
  return {
    ...args,
    amountIn,
    slippageBps: parameters.slippageBps,
  }
}

/** Raises a quoted input by basis points with ceiling rounding. @internal */
function maximumInput(amountIn: bigint, slippageBps: number): bigint {
  if (amountIn <= 0n)
    throw new EarnShares.InvalidExpectedOutputError({ expected: amountIn })
  const slippage = BigInt(slippageBps)
  if (slippage < 0n || slippage >= EarnShares.basisPointScale)
    throw new EarnShares.InvalidSlippageError({ slippageBps: slippage })
  const numerator = amountIn * (EarnShares.basisPointScale + slippage)
  // Adding the denominator minus one converts floor division to ceiling.
  return (
    (numerator + EarnShares.basisPointScale - 1n) / EarnShares.basisPointScale
  )
}

/**
 * Converts an amount to base units, resolving missing decimals with live
 * reads of the vault's asset or share token. Vault share tokens are not
 * genesis-declared, so nothing is cached. @internal
 */
async function toBaseUnitsLive(
  client: Client<Transport, Chain | undefined>,
  options: {
    amount: internal_Token.AmountInput
    token: 'asset' | 'shareToken'
    vault: Address
  },
): Promise<bigint> {
  const { amount, token, vault } = options
  if (typeof amount === 'bigint') return amount
  if (amount.decimals !== undefined)
    return internal_Token.toBaseUnits(amount, amount.decimals)
  const address = await readContract(client, {
    abi: Abis.vaultAdapter,
    address: vault,
    functionName: token,
  })
  const { decimals } = await resolveTokenWithDecimals(client, {
    token: address,
  })
  return internal_Token.toBaseUnits(amount, decimals)
}

/** Defaults a write's `recipient` to the sending account's address. @internal */
function resolveRecipient(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: {
    account?: Account | Address | null | undefined
    recipient?: Address | undefined
  },
): Address {
  if (parameters.recipient) return parameters.recipient
  const account = parameters.account ?? client.account
  if (!account) throw new AccountNotFoundError()
  return parseAccount(account).address
}
