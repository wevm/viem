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
 *   assetAmount: 100_000_000n,
 *   shareAmount: 99_900_000n,
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
    assetAmount: internal_Token.AmountInput
    /** Vault share recipient. @default `account.address` */
    recipient?: Address | undefined
    /** Vault address. */
    vault: Address
  } & OneOf<
    | {
        /** Minimum vault share output to accept; must be greater than zero. */
        shareAmountMin: bigint
      }
    | {
        /** Quoted vault share output; floored by `slippageBps`. */
        shareAmount: bigint
        /** Slippage tolerance in basis points under `shareAmount` (50 = 0.5%). */
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
    const [args, assetToken] = await Promise.all([
      toDepositArgs(client, parameters as never),
      readContract(client, {
        abi: Abis.vaultAdapter,
        address: parameters.vault,
        functionName: 'asset',
      }),
    ])
    return (await action(client, {
      ...parameters,
      calls: deposit.calls({ ...args, assetToken }),
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
    const shareAmountMin = (() => {
      if (args.shareAmountMin !== undefined) return args.shareAmountMin
      return EarnShares.minimumOutput(
        args.shareAmount,
        BigInt(args.slippageBps),
      )
    })()
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'deposit',
      args: [
        internal_Token.toBaseUnits(args.assetAmount, undefined),
        recipient,
        shareAmountMin,
      ],
    })
  }
  export namespace call {
    export type Args = {
      /** Assets to deposit; base units or `{ formatted, decimals? }` (asset decimals). */
      assetAmount: internal_Token.AmountInput
      /** Vault share recipient. */
      recipient: Address
      /** Vault address. */
      vault: Address
    } & OneOf<
      | {
          /** Minimum vault share output to accept. */
          shareAmountMin: bigint
        }
      | {
          /** Quoted vault share output; floored by `slippageBps`. */
          shareAmount: bigint
          /** Slippage tolerance in basis points under `shareAmount` (50 = 0.5%). */
          slippageBps: number
        }
    >
  }

  /**
   * Defines the asset approval and deposit calls for atomic execution. Pass
   * `assetToken` and token decimals explicitly because this builder performs no reads.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(
    args: call.Args & {
      /** Asset token approved for the deposit. */
      assetToken: TokenId.TokenIdOrAddress
    },
  ) {
    const { assetToken, vault } = args
    const assetAmount = internal_Token.toBaseUnits(args.assetAmount, undefined)
    return [
      defineCall({
        address: TokenId.toAddress(assetToken),
        abi: Abis.tip20,
        functionName: 'approve',
        args: [vault, assetAmount],
      }),
      deposit.call({ ...args, assetAmount }),
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
 * const { shareAmount } = await Actions.earn.depositSync(client, {
 *   assetAmount: 100_000_000n,
 *   shareAmountMin: EarnShares.minimumOutput(99_900_000n, 50n),
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
    assetAmount: args.assets,
    caller: args.caller,
    receipt,
    recipient: args.receiver,
    shareAmount: args.shares,
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
    assetAmount: bigint
    /** Depositing caller. */
    caller: Address
    /** Transaction receipt. */
    receipt: TransactionReceipt
    /** Vault share recipient. */
    recipient: Address
    /** Vault shares minted. */
    shareAmount: bigint
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
 *   earnShareAmount: 499_000_000n,
 *   slippageBps: 30,
 *   vault: '0x...',
 *   venueShareAmount: 500_000_000n,
 *   venueShareToken: '0x...',
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
    venueShareAmount: bigint
    /** Vault share recipient. @default `account.address` */
    recipient?: Address | undefined
    /** Vault address. */
    vault: Address
    /** Venue share token approved for the deposit. */
    venueShareToken: Address
  } & OneOf<
    | {
        /** Minimum vault share output to accept; must be greater than zero. */
        earnShareAmountMin: bigint
      }
    | {
        /** Quoted vault share output; floored by `slippageBps`. */
        earnShareAmount: bigint
        /** Slippage tolerance in basis points under `earnShareAmount` (50 = 0.5%). */
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
        venueShareToken: parameters.venueShareToken,
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
    const { recipient, vault, venueShareAmount } = args
    const earnShareAmountMin = (() => {
      if (args.earnShareAmountMin !== undefined) return args.earnShareAmountMin
      return EarnShares.minimumOutput(
        args.earnShareAmount,
        BigInt(args.slippageBps),
      )
    })()
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'depositShares',
      args: [venueShareAmount, recipient, earnShareAmountMin],
    })
  }
  export namespace call {
    export type Args = {
      /** Venue shares to deposit, base units. */
      venueShareAmount: bigint
      /** Vault share recipient. */
      recipient: Address
      /** Vault address. */
      vault: Address
    } & OneOf<
      | {
          /** Minimum vault share output to accept. */
          earnShareAmountMin: bigint
        }
      | {
          /** Quoted vault share output; floored by `slippageBps`. */
          earnShareAmount: bigint
          /** Slippage tolerance in basis points under `earnShareAmount` (50 = 0.5%). */
          slippageBps: number
        }
    >
  }

  /**
   * Defines the venue share approval and deposit calls for atomic execution.
   * Pass the vault's current `engine` and `venueShareToken` explicitly.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(
    args: call.Args & {
      /** Current vault engine that pulls the venue shares. */
      engine: Address
      /** Venue share token pulled by the engine. */
      venueShareToken: Address
    },
  ) {
    const { engine, venueShareAmount, venueShareToken } = args
    return [
      defineCall({
        address: venueShareToken,
        abi: Abis.tip20,
        functionName: 'approve',
        args: [engine, venueShareAmount],
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
 * const { earnShareAmount } = await Actions.earn.depositSharesSync(client, {
 *   earnShareAmount: 499_000_000n,
 *   slippageBps: 30,
 *   vault: '0x...',
 *   venueShareAmount: 500_000_000n,
 *   venueShareToken: '0x...',
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
    earnShareAmount: args.earnShares,
    receipt,
    receivedVenueShareAmount: args.receivedVenueShares,
    recipient: args.receiver,
    venueShareAmount: args.requestedVenueShares,
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
    earnShareAmount: bigint
    /** Transaction receipt. */
    receipt: TransactionReceipt
    /** Venue shares measured as received by the engine. */
    receivedVenueShareAmount: bigint
    /** Vault share recipient. */
    recipient: Address
    /** Venue shares requested for pull. */
    venueShareAmount: bigint
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
  const [assetToken, shareToken] = await multicall(client, {
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
          address: assetToken,
          abi: Abis.tip20,
          functionName: 'allowance',
          args: [account, vault],
        }),
        defineCall({
          address: assetToken,
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
    assetAllowance,
    assetBalance,
    assetToken,
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
    /** Assets the vault may spend from the account. */
    assetAllowance: bigint
    /** Asset balance held by the account. */
    assetBalance: bigint
    /** Token accepted by the vault. */
    assetToken: Address
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
 * const assetAmount = await Actions.earn.getRedeemQuote(client, {
 *   shareAmount: 100_000_000n,
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
  const { shareAmount, vault, ...rest } = parameters
  return readContract(client, {
    ...rest,
    abi: Abis.vaultAdapter,
    address: vault,
    args: [shareAmount],
    functionName: 'previewRedeem',
  })
}

export namespace getRedeemQuote {
  export type Args = {
    /** Exact vault share input, base units. */
    shareAmount: bigint
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
    assetToken,
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
    assetToken,
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
    /** Token accepted by the vault. */
    assetToken: Address
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
 * const shareAmount = await Actions.earn.getWithdrawQuote(client, {
 *   assetAmount: 250_000_000n,
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
  const { assetAmount, vault, ...rest } = parameters
  return readContract(client, {
    ...rest,
    abi: Abis.vaultAdapter,
    address: vault,
    args: [assetAmount],
    functionName: 'previewWithdraw',
  })
}

export namespace getWithdrawQuote {
  export type Args = {
    /** Exact asset output, base units. */
    assetAmount: bigint
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
 *   shareAmount: 100_000_000n,
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
    shareAmount: internal_Token.AmountInput
    /** Asset recipient. @default `account.address` */
    recipient?: Address | undefined
    /** Vault address. */
    vault: Address
  } & OneOf<
    | {
        /** Minimum asset output to accept; must be greater than zero. */
        assetAmountMin: bigint
      }
    | {
        /** Slippage tolerance in basis points under a live {@link getRedeemQuote} (50 = 0.5%). */
        slippageBps: number
      }
    | {
        /** Quoted asset output; floored by `slippageBps`. */
        assetAmount: bigint
        /** Slippage tolerance in basis points under `assetAmount` (50 = 0.5%). */
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
      calls: redeem.calls({ ...args, shareToken }),
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
    const assetAmountMin = (() => {
      if (args.assetAmountMin !== undefined) return args.assetAmountMin
      return EarnShares.minimumOutput(
        args.assetAmount,
        BigInt(args.slippageBps),
      )
    })()
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'redeem',
      args: [
        internal_Token.toBaseUnits(args.shareAmount, undefined),
        recipient,
        assetAmountMin,
      ],
    })
  }
  export namespace call {
    export type Args = {
      /** Vault shares to redeem; base units or `{ formatted, decimals? }`. */
      shareAmount: internal_Token.AmountInput
      /** Asset recipient. */
      recipient: Address
      /** Vault address. */
      vault: Address
    } & OneOf<
      | {
          /** Minimum asset output to accept. */
          assetAmountMin: bigint
        }
      | {
          /** Quoted asset output; floored by `slippageBps`. */
          assetAmount: bigint
          /** Slippage tolerance in basis points under `assetAmount` (50 = 0.5%). */
          slippageBps: number
        }
    >
  }

  /**
   * Defines the vault share approval and redeem calls for atomic execution.
   * Pass `shareToken` explicitly because this builder performs no reads.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(
    args: call.Args & {
      /** Vault share token approved for the redemption. */
      shareToken: Address
    },
  ) {
    const { shareToken, vault } = args
    const shareAmount = internal_Token.toBaseUnits(args.shareAmount, undefined)
    return [
      defineCall({
        address: shareToken,
        abi: Abis.tip20,
        functionName: 'approve',
        args: [vault, shareAmount],
      }),
      redeem.call({ ...args, shareAmount }),
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
 * const { assetAmount } = await Actions.earn.redeemSync(client, {
 *   assetAmountMin: 99_500_000n,
 *   shareAmount: 100_000_000n,
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
    assetAmount: args.assets,
    caller: args.caller,
    receipt,
    recipient: args.receiver,
    shareAmount: args.shares,
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
    assetAmount: bigint
    /** Redeeming caller. */
    caller: Address
    /** Transaction receipt. */
    receipt: TransactionReceipt
    /** Asset recipient. */
    recipient: Address
    /** Vault shares burned. */
    shareAmount: bigint
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
 *   assetAmount: 40_000_000n,
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
    assetAmount: internal_Token.AmountInput
    /** Asset recipient. @default `account.address` */
    recipient?: Address | undefined
    /** Vault address. */
    vault: Address
  } & OneOf<
    | {
        /** Maximum vault share input to burn. */
        shareAmountMax: bigint
      }
    | {
        /** Slippage headroom above a live {@link getWithdrawQuote}, ceiling-rounded (50 = 0.5%). */
        slippageBps: number
      }
    | {
        /** Quoted vault share input; raised by `slippageBps`. */
        shareAmount: bigint
        /** Slippage tolerance in basis points over `shareAmount` (50 = 0.5%). */
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
      calls: withdrawExact.calls({ ...args, shareToken }),
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
    const shareAmountMax = (() => {
      if (args.shareAmountMax !== undefined) return args.shareAmountMax
      return maximumInput(args.shareAmount, args.slippageBps)
    })()
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'withdrawExact',
      args: [
        internal_Token.toBaseUnits(args.assetAmount, undefined),
        recipient,
        shareAmountMax,
      ],
    })
  }
  export namespace call {
    export type Args = {
      /** Exact assets to receive; base units or `{ formatted, decimals? }`. */
      assetAmount: internal_Token.AmountInput
      /** Asset recipient. */
      recipient: Address
      /** Vault address. */
      vault: Address
    } & OneOf<
      | {
          /** Maximum vault share input to burn. */
          shareAmountMax: bigint
        }
      | {
          /** Quoted vault share input; raised by `slippageBps`. */
          shareAmount: bigint
          /** Slippage tolerance in basis points over `shareAmount` (50 = 0.5%). */
          slippageBps: number
        }
    >
  }

  /**
   * Defines the vault share approval and withdrawal calls for atomic
   * execution. Pass `shareToken` explicitly because this builder performs no reads.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(
    args: call.Args & {
      /** Vault share token approved for the withdrawal. */
      shareToken: Address
    },
  ) {
    const { shareToken, vault } = args
    const assetAmount = internal_Token.toBaseUnits(args.assetAmount, undefined)
    const call = withdrawExact.call({ ...args, assetAmount })
    const [, , shareAmountMax] = call.args
    return [
      defineCall({
        address: shareToken,
        abi: Abis.tip20,
        functionName: 'approve',
        args: [vault, shareAmountMax],
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
 * const { shareAmount } = await Actions.earn.withdrawExactSync(client, {
 *   assetAmount: 40_000_000n,
 *   shareAmountMax: 40_200_000n,
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
    assetAmount: args.assets,
    caller: args.caller,
    receipt,
    recipient: args.receiver,
    shareAmount: args.sharesBurned,
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
    assetAmount: bigint
    /** Withdrawing caller. */
    caller: Address
    /** Transaction receipt. */
    receipt: TransactionReceipt
    /** Asset recipient. */
    recipient: Address
    /** Vault shares burned. */
    shareAmount: bigint
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
  const assetAmount = await toBaseUnitsLive(client, {
    amount: parameters.assetAmount,
    token: 'asset',
    vault,
  })
  const args = {
    assetAmount,
    recipient: resolveRecipient(client, parameters),
    vault,
  }
  if (parameters.shareAmountMin !== undefined)
    return { ...args, shareAmountMin: parameters.shareAmountMin }
  return {
    ...args,
    shareAmount: parameters.shareAmount,
    slippageBps: parameters.slippageBps,
  }
}

/** Resolves `depositShares` parameters into the adapter call args. @internal */
function toDepositSharesArgs(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: depositShares.Parameters,
): depositShares.call.Args {
  const { vault, venueShareAmount } = parameters
  const args = {
    recipient: resolveRecipient(client, parameters),
    vault,
    venueShareAmount,
  }
  if (parameters.earnShareAmountMin !== undefined)
    return { ...args, earnShareAmountMin: parameters.earnShareAmountMin }
  return {
    ...args,
    earnShareAmount: parameters.earnShareAmount,
    slippageBps: parameters.slippageBps,
  }
}

/** Resolves `redeem` parameters into the adapter call args. @internal */
async function toRedeemArgs(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: redeem.Parameters,
): Promise<redeem.call.Args> {
  const { vault } = parameters
  const shareAmount = await toBaseUnitsLive(client, {
    amount: parameters.shareAmount,
    token: 'shareToken',
    vault,
  })
  const args = {
    recipient: resolveRecipient(client, parameters),
    shareAmount,
    vault,
  }
  if (parameters.assetAmountMin !== undefined)
    return { ...args, assetAmountMin: parameters.assetAmountMin }
  const assetAmount = await (async () => {
    if (parameters.assetAmount !== undefined) return parameters.assetAmount
    return getRedeemQuote(client, { shareAmount, vault })
  })()
  return {
    ...args,
    assetAmount,
    slippageBps: parameters.slippageBps,
  }
}

/** Resolves `withdrawExact` parameters into the adapter call args. @internal */
async function toWithdrawExactArgs(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: withdrawExact.Parameters,
): Promise<withdrawExact.call.Args> {
  const { vault } = parameters
  const assetAmount = await toBaseUnitsLive(client, {
    amount: parameters.assetAmount,
    token: 'asset',
    vault,
  })
  const args = {
    assetAmount,
    recipient: resolveRecipient(client, parameters),
    vault,
  }
  if (parameters.shareAmountMax !== undefined)
    return { ...args, shareAmountMax: parameters.shareAmountMax }
  const shareAmount = await (async () => {
    if (parameters.shareAmount !== undefined) return parameters.shareAmount
    return getWithdrawQuote(client, { assetAmount, vault })
  })()
  return {
    ...args,
    shareAmount,
    slippageBps: parameters.slippageBps,
  }
}

/** Raises a quoted input by basis points with ceiling rounding. @internal */
function maximumInput(shareAmount: bigint, slippageBps: number): bigint {
  if (shareAmount <= 0n)
    throw new EarnShares.InvalidExpectedOutputError({ expected: shareAmount })
  const slippage = BigInt(slippageBps)
  if (slippage < 0n || slippage >= EarnShares.basisPointScale)
    throw new EarnShares.InvalidSlippageError({ slippageBps: slippage })
  const numerator = shareAmount * (EarnShares.basisPointScale + slippage)
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
