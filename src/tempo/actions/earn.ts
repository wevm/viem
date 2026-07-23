import type { Address } from 'abitype'
import { Hex } from 'ox'
import { EarnShares, TokenId } from 'ox/tempo'
import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { estimateContractGas } from '../../actions/public/estimateContractGas.js'
import { getBlockNumber } from '../../actions/public/getBlockNumber.js'
import { type GetLogsErrorType, getLogs } from '../../actions/public/getLogs.js'
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
import { writeContractSync } from '../../actions/wallet/writeContractSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { Log } from '../../types/log.js'
import type { Compute, OneOf } from '../../types/utils.js'
import { encodeAbiParameters } from '../../utils/abi/encodeAbiParameters.js'
import { getAbiItem } from '../../utils/abi/getAbiItem.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import { getAddress } from '../../utils/address/getAddress.js'
import { isAddressEqual } from '../../utils/address/isAddressEqual.js'
import { type ObserveErrorType, observe } from '../../utils/observe.js'
import { type PollErrorType, poll } from '../../utils/poll.js'
import { withResolvers } from '../../utils/promise/withResolvers.js'
import { stringify } from '../../utils/stringify.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import {
  GetVaultEngineChangedError,
  type GetVaultEngineChangedErrorType,
  WaitForPrivateDepositTimeoutError,
  type WaitForPrivateDepositTimeoutErrorType,
  WaitForPrivateRedeemTimeoutError,
  type WaitForPrivateRedeemTimeoutErrorType,
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
import * as policyActions from './policy.js'
import * as tokenActions from './token.js'
import * as zoneActions from './zone.js'

/** TIP-403 policy ID that allows every sender, recipient, and mint recipient. */
export const alwaysAllowPolicyId = 1n

/** Admission-only TIP-403 policy attached to an Earn vault share token. */
export type ExitSafePolicy = {
  /** Compound policy attached to the vault share token. */
  transferPolicyId: bigint
  /** Sender policy. Must be {@link alwaysAllowPolicyId} so holders can exit. */
  senderPolicyId: bigint
  /** Recipient eligibility policy. */
  recipientPolicyId: bigint
  /** Mint-recipient eligibility policy. Must match `recipientPolicyId`. */
  mintRecipientPolicyId: bigint
}

/** Receipts produced while configuring an exit-safe Earn policy. */
export type ExitSafePolicyReceipts = {
  /** Whitelist policy creation receipt. */
  eligibilityPolicy: TransactionReceipt
  /** Compound policy creation receipt. */
  compoundPolicy: TransactionReceipt
  /** Vault share token policy update receipt. */
  tokenPolicy: TransactionReceipt
  /** Eligibility policy admin transfer receipt, when an administrator is provided. */
  policyAdmin?: TransactionReceipt | undefined
}

/**
 * Creates and attaches an admission-only TIP-403 policy to an Earn vault share
 * token. Existing holders remain able to send shares while recipients and mint
 * recipients must belong to the same whitelist.
 *
 * The action submits three or four sequential transactions and is not atomic.
 * Use {@link validateExitSafePolicy} to verify the final state.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const account = privateKeyToAccount('0x...')
 * const client = createClient({
 *   account,
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const { policy, receipts } =
 *   await Actions.earn.configureExitSafePolicy(client, {
 *     accessAdministrator: '0x...',
 *     initialMembers: ['0x...', '0x...'],
 *     earnToken: '0x...',
 *   })
 * ```
 *
 * @param client - Client authorized to change the vault share token policy.
 * @param parameters - Share token, administrator, and initial members.
 * @returns The configured policy IDs and transaction receipts.
 */
export async function configureExitSafePolicy<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: configureExitSafePolicy.Parameters<account>,
): Promise<configureExitSafePolicy.ReturnValue> {
  const account_ = parameters.account ?? client.account
  if (!account_) throw new AccountNotFoundError()
  const account = parseAccount(account_)
  const initialMembers = [
    ...new Set(parameters.initialMembers.map((member) => getAddress(member))),
  ]
  if (initialMembers.length === 0)
    throw new Error('At least one initial policy member is required.')

  const eligibility = await policyActions.createSync(client, {
    account,
    addresses: initialMembers,
    chain: client.chain,
    type: 'whitelist',
  } as never)
  const compoundPolicy = await writeContractSync(client, {
    account,
    abi: Abis.tip403Registry,
    address: Addresses.tip403Registry,
    args: [alwaysAllowPolicyId, eligibility.policyId, eligibility.policyId],
    chain: client.chain,
    functionName: 'createCompoundPolicy',
    throwOnReceiptRevert: true,
  } as never)
  const [compoundEvent] = parseEventLogs({
    abi: Abis.tip403Registry,
    eventName: 'CompoundPolicyCreated',
    logs: compoundPolicy.logs,
    strict: true,
  })
  if (!compoundEvent)
    throw new Error('`CompoundPolicyCreated` event not found.')

  const tokenPolicy = await tokenActions.changeTransferPolicySync(client, {
    account,
    chain: client.chain,
    policyId: compoundEvent.args.policyId,
    token: parameters.earnToken,
  } as never)
  const policyAdmin = isAddressEqual(
    parameters.accessAdministrator,
    account.address,
  )
    ? undefined
    : await policyActions.setAdminSync(client, {
        account,
        admin: parameters.accessAdministrator,
        chain: client.chain,
        policyId: eligibility.policyId,
      } as never)

  return {
    policy: {
      transferPolicyId: compoundEvent.args.policyId,
      senderPolicyId: alwaysAllowPolicyId,
      recipientPolicyId: eligibility.policyId,
      mintRecipientPolicyId: eligibility.policyId,
    },
    receipts: {
      eligibilityPolicy: eligibility.receipt,
      compoundPolicy,
      tokenPolicy: tokenPolicy.receipt,
      policyAdmin: policyAdmin?.receipt,
    },
  }
}

export namespace configureExitSafePolicy {
  export type Args = {
    /** Address that will administer recipient eligibility. */
    accessAdministrator: Address
    /** Addresses initially eligible to receive or be minted vault shares. */
    initialMembers: readonly Address[]
    /** Earn vault share token. */
    earnToken: Address
  }
  export type Parameters<
    account extends Account | undefined = Account | undefined,
  > = GetAccountParameter<account> & Args
  export type ReturnValue = Compute<{
    /** Configured onchain policy IDs. */
    policy: ExitSafePolicy
    /** Receipts for each configuration transaction. */
    receipts: ExitSafePolicyReceipts
  }>
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Verifies that an Earn vault share token uses the expected exit-safe TIP-403
 * policy and that every required member can receive transfers and mints.
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
 * await Actions.earn.validateExitSafePolicy(client, {
 *   accessAdministrator: '0x...',
 *   policy: {
 *     transferPolicyId: 3n,
 *     senderPolicyId: 1n,
 *     recipientPolicyId: 2n,
 *     mintRecipientPolicyId: 2n,
 *   },
 *   requiredMembers: ['0x...', '0x...'],
 *   earnToken: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Expected policy, administrator, and required members.
 * @returns Nothing when the policy is valid.
 */
export async function validateExitSafePolicy<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: validateExitSafePolicy.Parameters,
): Promise<validateExitSafePolicy.ReturnValue> {
  const { accessAdministrator, policy, requiredMembers, earnToken, ...rest } =
    parameters
  const [tokenPolicyId, compound, simplePolicy, memberResults] =
    await Promise.all([
      readContract(client, {
        ...rest,
        abi: Abis.tip20,
        address: earnToken,
        functionName: 'transferPolicyId',
      }),
      readContract(client, {
        ...rest,
        abi: Abis.tip403Registry,
        address: Addresses.tip403Registry,
        args: [policy.transferPolicyId],
        functionName: 'compoundPolicyData',
      }),
      readContract(client, {
        ...rest,
        abi: Abis.tip403Registry,
        address: Addresses.tip403Registry,
        args: [policy.recipientPolicyId],
        functionName: 'policyData',
      }),
      Promise.all(
        requiredMembers.map(async (member) => {
          const [recipient, mintRecipient] = await Promise.all([
            readContract(client, {
              ...rest,
              abi: Abis.tip403Registry,
              address: Addresses.tip403Registry,
              args: [policy.transferPolicyId, member],
              functionName: 'isAuthorizedRecipient',
            }),
            readContract(client, {
              ...rest,
              abi: Abis.tip403Registry,
              address: Addresses.tip403Registry,
              args: [policy.transferPolicyId, member],
              functionName: 'isAuthorizedMintRecipient',
            }),
          ])
          return { member, mintRecipient, recipient }
        }),
      ),
    ])

  if (tokenPolicyId !== policy.transferPolicyId)
    throw new Error('Earn vault share token transfer policy mismatch.')
  if (
    compound[0] !== policy.senderPolicyId ||
    compound[1] !== policy.recipientPolicyId ||
    compound[2] !== policy.mintRecipientPolicyId
  )
    throw new Error('TIP-403 compound policy components mismatch.')
  if (policy.senderPolicyId !== alwaysAllowPolicyId)
    throw new Error('TIP-403 sender policy is not always allow.')
  if (policy.recipientPolicyId !== policy.mintRecipientPolicyId)
    throw new Error('TIP-403 recipient and mint-recipient policies must match.')
  if (simplePolicy[0] !== 0)
    throw new Error('TIP-403 eligibility policy is not a whitelist.')
  if (!isAddressEqual(simplePolicy[1], accessAdministrator))
    throw new Error('TIP-403 access administrator mismatch.')
  const unauthorized = memberResults.find(
    (result) => !result.recipient || !result.mintRecipient,
  )
  if (unauthorized)
    throw new Error(
      `Required TIP-403 member is unauthorized: ${unauthorized.member}`,
    )
}

export namespace validateExitSafePolicy {
  export type Args = {
    /** Expected eligibility policy administrator. */
    accessAdministrator: Address
    /** Expected exit-safe policy IDs. */
    policy: ExitSafePolicy
    /** Addresses that must be eligible to receive or be minted vault shares. */
    requiredMembers: readonly Address[]
    /** Earn vault share token. */
    earnToken: Address
  }
  export type Parameters = Omit<ReadParameters, 'account'> & Args
  export type ReturnValue = void
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

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
 *   earnAmount: 99_900_000n,
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
        earnAmountMin: bigint
      }
    | {
        /** Quoted vault share output; floored by `slippageBps`. */
        earnAmount: bigint
        /** Slippage tolerance in basis points under `earnAmount` (50 = 0.5%). */
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
    const earnAmountMin = (() => {
      if (args.earnAmountMin !== undefined) return args.earnAmountMin
      return EarnShares.minimumOutput(args.earnAmount, args.slippageBps)
    })()
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'deposit',
      args: [
        internal_Token.toBaseUnits(args.assetAmount, undefined),
        recipient,
        earnAmountMin,
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
          earnAmountMin: bigint
        }
      | {
          /** Quoted vault share output; floored by `slippageBps`. */
          earnAmount: bigint
          /** Slippage tolerance in basis points under `earnAmount` (50 = 0.5%). */
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
 * const { earnAmount } = await Actions.earn.depositSync(client, {
 *   assetAmount: 100_000_000n,
 *   earnAmountMin: EarnShares.minimumOutput(99_900_000n, 50),
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
    earnAmount: args.earnAmount,
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
    earnAmount: bigint
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
 * const hash = await Actions.earn.depositVenueShares(client, {
 *   earnAmount: 499_000_000n,
 *   slippageBps: 30,
 *   vault: '0x...',
 *   venueShares: 500_000_000n,
 *   venueShareToken: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function depositVenueShares<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: depositVenueShares.Parameters<chain, account>,
): Promise<depositVenueShares.ReturnValue> {
  return depositVenueShares.inner(sendTransaction, client, parameters)
}

export namespace depositVenueShares {
  export type Args = {
    /** Venue shares to deposit, base units. */
    venueShares: bigint
    /** Vault share recipient. @default `account.address` */
    recipient?: Address | undefined
    /** Vault address. */
    vault: Address
    /** Venue share token approved for the deposit. */
    venueShareToken: Address
  } & OneOf<
    | {
        /** Minimum vault share output to accept; must be greater than zero. */
        earnAmountMin: bigint
      }
    | {
        /** Quoted vault share output; floored by `slippageBps`. */
        earnAmount: bigint
        /** Slippage tolerance in basis points under `earnAmount` (50 = 0.5%). */
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
    parameters: depositVenueShares.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const engine = await readContract(client, {
      abi: Abis.vaultAdapter,
      address: parameters.vault,
      functionName: 'engine',
    })
    return (await action(client, {
      ...parameters,
      calls: depositVenueShares.calls({
        ...toDepositVenueSharesArgs(client, parameters as never),
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
    const { recipient, vault, venueShares } = args
    const earnAmountMin = (() => {
      if (args.earnAmountMin !== undefined) return args.earnAmountMin
      return EarnShares.minimumOutput(args.earnAmount, args.slippageBps)
    })()
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'depositVenueShares',
      args: [venueShares, recipient, earnAmountMin],
    })
  }
  export namespace call {
    export type Args = {
      /** Venue shares to deposit, base units. */
      venueShares: bigint
      /** Vault share recipient. */
      recipient: Address
      /** Vault address. */
      vault: Address
    } & OneOf<
      | {
          /** Minimum vault share output to accept. */
          earnAmountMin: bigint
        }
      | {
          /** Quoted vault share output; floored by `slippageBps`. */
          earnAmount: bigint
          /** Slippage tolerance in basis points under `earnAmount` (50 = 0.5%). */
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
    const { engine, venueShares, venueShareToken } = args
    return [
      defineCall({
        address: venueShareToken,
        abi: Abis.tip20,
        functionName: 'approve',
        args: [engine, venueShares],
      }),
      depositVenueShares.call(args),
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
    parameters: depositVenueShares.Parameters<chain, account>,
  ): Promise<bigint> {
    return estimateContractGas(client, {
      ...pickWriteParameters(parameters as never),
      ...depositVenueShares.call(
        toDepositVenueSharesArgs(client, parameters as never),
      ),
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
    parameters: depositVenueShares.Parameters<chain, account>,
  ): Promise<
    SimulateContractReturnType<typeof Abis.vaultAdapter, 'depositVenueShares'>
  > {
    return simulateContract(client, {
      ...pickWriteParameters(parameters as never),
      ...depositVenueShares.call(
        toDepositVenueSharesArgs(client, parameters as never),
      ),
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
 * const { earnAmount } = await Actions.earn.depositVenueSharesSync(client, {
 *   earnAmount: 499_000_000n,
 *   slippageBps: 30,
 *   vault: '0x...',
 *   venueShares: 500_000_000n,
 *   venueShareToken: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function depositVenueSharesSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: depositVenueSharesSync.Parameters<chain, account>,
): Promise<depositVenueSharesSync.ReturnValue> {
  const { throwOnReceiptRevert = true, vault } = parameters
  const receipt = await depositVenueShares.inner(sendTransactionSync, client, {
    ...parameters,
    throwOnReceiptRevert,
  } as never)
  const { args } = depositVenueShares.extractEvent(receipt.logs, { vault })
  return {
    caller: args.caller,
    earnAmount: args.earnAmount,
    receipt,
    receivedVenueShares: args.receivedVenueShares,
    recipient: args.receiver,
    venueShares: args.requestedVenueShares,
  }
}

export namespace depositVenueSharesSync {
  export type Args = depositVenueShares.Args
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = depositVenueShares.Parameters<chain, account> &
    WriteSyncParameters<chain, account>
  export type ReturnValue = Compute<{
    /** Depositing caller. */
    caller: Address
    /** Vault shares minted. */
    earnAmount: bigint
    /** Transaction receipt. */
    receipt: TransactionReceipt
    /** Venue shares measured as received by the engine. */
    receivedVenueShares: bigint
    /** Vault share recipient. */
    recipient: Address
    /** Venue shares requested for pull. */
    venueShares: bigint
  }>
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Withdraws assets from a Zone and deposits them into a vault on the parent
 * chain. Use {@link privateDeposit.prepare} to build the encrypted callback.
 *
 * @example
 * ```ts
 * const prepared = await Actions.earn.privateDeposit.prepare(parentClient, {
 *   assetAmount: 100_000_000n,
 *   assetToken: '0x...',
 *   earnRouter: '0x...',
 *   recipient: '0x...',
 *   recoveryRecipient: '0x...',
 *   earnAmountMin: 99_500_000n,
 *   vaultAssetAmountMin: 99_000_000n,
 * })
 * const hash = await Actions.earn.privateDeposit(zoneClient, prepared)
 * ```
 *
 * @param client - Zone client.
 * @param parameters - Prepared deposit and transaction parameters.
 * @returns The transaction hash.
 */
export async function privateDeposit<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: privateDeposit.Parameters<chain, account>,
): Promise<privateDeposit.ReturnValue> {
  await assertPreparedZoneRequestChain(client, parameters)
  return zoneActions.requestWithdrawal(client, parameters)
}

export namespace privateDeposit {
  export type Args = prepare.ReturnValue
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args
  export type ReturnValue = SendTransactionReturnType
  export type ErrorType = zoneActions.requestWithdrawal.ErrorType

  /**
   * Builds an encrypted Zone withdrawal that deposits into the earnRouter's
   * vault and returns the resulting shares to the Zone.
   *
   * @param client - Parent-chain client.
   * @param parameters - Deposit intent and recovery parameters.
   * @returns The prepared withdrawal and correlation data.
   */
  export async function prepare<chain extends Chain | undefined>(
    client: Client<Transport, chain>,
    parameters: prepare.Parameters,
  ): Promise<prepare.ReturnValue> {
    const chainId = client.chain?.id
    if (!chainId) throw new Error('`chain` is required.')
    const {
      actionId = Hex.random(32),
      assetAmount,
      callbackGas = earnRouterCallbackGas,
      fallbackRecipient = parameters.recoveryRecipient,
      adapter,
      earnRouter,
      recipient,
      recoveryRecipient,
      returnMemo,
      withdrawalMemo,
      zoneId,
    } = parameters
    const readParameters = pickReadParameters(parameters)
    const [fromBlock, [vaultAsset, earnToken]] = await Promise.all([
      getBlockNumber(client, { cacheTime: 0 }),
      multicall(client, {
        ...readParameters,
        allowFailure: false,
        contracts: [
          defineCall({
            abi: Abis.vaultAdapter,
            address: adapter,
            functionName: 'asset',
          }),
          defineCall({
            abi: Abis.vaultAdapter,
            address: adapter,
            functionName: 'earnToken',
          }),
        ],
        deployless: true,
      }),
    ])
    const assetToken = parameters.assetToken ?? vaultAsset
    const { encrypted, keyIndex } =
      await zoneActions.encryptedDeposit.prepareRecipient(client, {
        ...readParameters,
        memo: returnMemo,
        portalAddress: parameters.portalAddress,
        recipient,
        zoneId,
      })
    const earnAmountMin = resolveMinimumEarnAmount(parameters)
    const direct = isAddressEqual(assetToken, vaultAsset)
    const destinationData = encodeAbiParameters(Abis.earnRouterZoneReturn, [
      { encrypted, keyIndex, refundRecipient: recoveryRecipient },
    ])
    const data = encodeAbiParameters(Abis.earnRouterCallbackData, [
      {
        flow: 0,
        adapter,
        destination: 0,
        outputToken: earnToken,
        minVaultAssets: direct
          ? assetAmount
          : (parameters.vaultAssetAmountMin ?? 0n),
        minEarnAmount: earnAmountMin,
        minOutputAmount: 0n,
        actionId,
        destinationData,
      },
    ])
    return {
      actionId,
      amount: assetAmount,
      callbackGas,
      chainId,
      data,
      fallbackRecipient,
      fromBlock,
      memo: withdrawalMemo,
      to: earnRouter,
      token: assetToken,
      zoneId,
    }
  }

  export namespace prepare {
    export type Parameters = Omit<ReadParameters, 'account'> & Args
    export type Args = PrivatePreparationParameters & {
      /** Assets withdrawn from the Zone, base units. */
      assetAmount: bigint
      /** Asset token withdrawn from the Zone. @default earnRouter vault asset */
      assetToken?: Address | undefined
      /** Minimum earnRouter vault assets accepted after swapping `assetToken`. @default `0n` */
      vaultAssetAmountMin?: bigint | undefined
    } & MinimumEarnAmountParameters
    export type ReturnValue = PreparedZoneRequest
    export type ErrorType = BaseErrorType
  }

  /**
   * Defines the approval and Zone withdrawal calls for a prepared deposit.
   *
   * @param args - Prepared deposit arguments.
   * @returns The Zone withdrawal calls.
   */
  export function calls(args: Args) {
    return zoneActions.requestWithdrawal.calls(args)
  }
}

/**
 * Requests a private Zone deposit and waits for the Zone transaction receipt.
 * The receipt confirms withdrawal acceptance, not the parent-chain deposit.
 *
 * @param client - Zone client.
 * @param parameters - Prepared deposit and transaction parameters.
 * @returns The Zone transaction receipt and parent-chain withdrawal sender tag.
 */
export async function privateDepositSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: privateDepositSync.Parameters<chain, account>,
): Promise<privateDepositSync.ReturnValue> {
  await assertPreparedZoneRequestChain(client, parameters)
  return zoneActions.requestWithdrawalSync(client, parameters)
}

export namespace privateDepositSync {
  export type Args = privateDeposit.Args
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = privateDeposit.Parameters<chain, account> &
    WriteSyncParameters<chain, account>
  export type ReturnValue = zoneActions.requestWithdrawalSync.ReturnValue
  export type ErrorType = zoneActions.requestWithdrawalSync.ErrorType
}

/**
 * Waits for a Zone earnRouter deposit to complete on the parent chain.
 *
 * @example
 * ```ts
 * const result = await Actions.earn.waitForPrivateDeposit(parentClient, {
 *   actionId: prepared.actionId,
 *   fromBlock: prepared.fromBlock,
 *   earnRouter: '0x...',
 * })
 * ```
 *
 * @param client - Parent-chain client.
 * @param parameters - Prepared action correlation and polling parameters.
 * @returns The completed earnRouter deposit.
 */
export async function waitForPrivateDeposit<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: waitForPrivateDeposit.Parameters,
): Promise<waitForPrivateDeposit.ReturnType> {
  const {
    actionId,
    fromBlock,
    earnRouter,
    pollingInterval = client.pollingInterval,
    timeout = 60_000,
  } = parameters
  const event = getAbiItem({
    abi: Abis.earnRouter,
    name: 'EarnDeposit',
  })
  const observerId = stringify([
    'waitForPrivateDeposit',
    client.uid,
    earnRouter,
    actionId,
    fromBlock,
  ])
  const { promise, reject, resolve } =
    withResolvers<waitForPrivateDeposit.ReturnType>()

  let timer: ReturnType<typeof setTimeout> | undefined
  let unobserve: () => void
  const cleanup = () => {
    clearTimeout(timer)
    unobserve()
  }
  const resolve_ = (result: waitForPrivateDeposit.ReturnType) => {
    cleanup()
    resolve(result)
  }
  const reject_ = (error: unknown) => {
    cleanup()
    reject(error)
  }

  unobserve = observe(
    observerId,
    { reject: reject_, resolve: resolve_ },
    (emit) => {
      const unpoll = poll(
        async () => {
          try {
            const [log] = await getLogs(client, {
              address: earnRouter,
              args: { actionId },
              event,
              fromBlock,
              strict: true,
              toBlock: 'latest',
            })
            if (!log) return
            unpoll()
            emit.resolve({
              actionId: log.args.actionId,
              inputAmount: log.args.inputAmount,
              inputToken: log.args.inputToken,
              earnAmount: log.args.earnAmount,
              tempoBlockNumber: log.blockNumber,
              vaultAssets: log.args.vaultAssets,
              zoneDepositHash: log.args.zoneDepositHash,
            })
          } catch (error) {
            unpoll()
            emit.reject(error)
          }
        },
        { emitOnBegin: true, interval: pollingInterval },
      )

      return unpoll
    },
  )

  timer = timeout
    ? setTimeout(() => {
        reject_(new WaitForPrivateDepositTimeoutError({ actionId, earnRouter }))
      }, timeout)
    : undefined

  return await promise
}

export namespace waitForPrivateDeposit {
  export type Parameters = {
    /** Correlation id from {@link privateDeposit.prepare}. */
    actionId: Hex.Hex
    /** Lower bound for the parent-chain log scan. */
    fromBlock: bigint
    /** Zone earnRouter address. */
    earnRouter: Address
    /** Polling frequency in milliseconds. @default `client.pollingInterval` */
    pollingInterval?: number | undefined
    /** Timeout in milliseconds; `0` disables it. @default `60_000` */
    timeout?: number | undefined
  }
  export type ReturnType = {
    /** Correlation id for the completed deposit. */
    actionId: Hex.Hex
    /** Tokens delivered to the earnRouter, base units. */
    inputAmount: bigint
    /** Token delivered to the earnRouter. */
    inputToken: Address
    /** EarnToken returned to the Zone. */
    earnAmount: bigint
    /** Parent-chain block containing the earnRouter event. */
    tempoBlockNumber: bigint
    /** Vault assets deposited after any swap. */
    vaultAssets: bigint
    /** Encrypted return deposit hash. */
    zoneDepositHash: Hex.Hex
  }
  export type ErrorType =
    | GetLogsErrorType
    | ObserveErrorType
    | PollErrorType
    | WaitForPrivateDepositTimeoutErrorType
    | BaseErrorType
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
  const earnFees = await readContract(client, {
    ...rest,
    abi: Abis.vaultAdapter,
    address: vault,
    functionName: 'earnFees',
  })
  const contracts = [
    defineCall({
      address: earnFees,
      abi: Abis.earnFees,
      functionName: 'currentFeeConfigId',
    }),
    defineCall({
      address: earnFees,
      abi: Abis.earnFees,
      functionName: 'feesActive',
    }),
    defineCall({
      address: earnFees,
      abi: Abis.earnFees,
      functionName: 'highWaterMark',
    }),
    defineCall({
      address: earnFees,
      abi: Abis.earnFees,
      functionName: 'previewAccruedFees',
    }),
    defineCall({
      address: earnFees,
      abi: Abis.earnFees,
      functionName: 'targetBase',
    }),
  ] as const
  // Stored configs are immutable per id, so a follow-up `feeConfig` read stays
  // consistent with the batched id.
  const feeConfig = async (configId: bigint) =>
    toFeeConfig(
      await readContract(client, {
        ...rest,
        abi: Abis.earnFees,
        address: earnFees,
        functionName: 'feeConfig',
        args: [configId],
      }),
    )
  if (recipient !== undefined) {
    const [
      configId,
      feesActive,
      highWaterMark,
      preview,
      targetBase,
      earnAmount,
    ] = await multicall(client, {
      ...rest,
      allowFailure: false,
      contracts: [
        ...contracts,
        defineCall({
          address: earnFees,
          abi: Abis.earnFees,
          functionName: 'claimableEarn',
          args: [recipient],
        }),
      ],
      deployless: true,
    })
    return {
      claimableEarn: earnAmount,
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
    /** Optional fee recipient whose claimable EarnToken amount is included. */
    recipient?: Address | undefined
    /** Vault address. */
    vault: Address
  }
  export type Parameters = Omit<ReadParameters, 'account'> & Args
  export type ReturnValue = {
    /** Claimable EarnToken for `recipient`; present when provided. */
    claimableEarn?: bigint | undefined
    /** Active fee configuration. */
    config: FeeConfig
    /** Active fee configuration id (starts at `1`). */
    configId: bigint
    /** Whether fees are configured and not emergency-disabled. */
    feesActive: boolean
    /** Post-fee high-water mark per EarnToken. */
    highWaterMark: bigint
    /** Pending fee amounts. */
    preview: FeePreview
    /** Excess-return fee target per EarnToken. */
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

/** Pending Earn fee amounts. */
export type FeePreview = {
  /** Assets backing active EarnToken. */
  activeAssets: bigint
  /** Fee allocations in assets and EarnToken. */
  allocations: readonly {
    account: Address
    feeAssets: bigint
    feeEarnAmount: bigint
  }[]
  /** Excess-return fee portion, asset units. */
  excessFeeAssets: bigint
  /** Fixed fee portion, asset units. */
  fixedFeeAssets: bigint
  /** Accrual above the high-water mark, asset units. */
  positiveAccrualAssets: bigint
  /** Scaled asset value per EarnToken after fees. */
  postFeeValuePerEarn: bigint
  /** Scaled asset value per EarnToken before fees. */
  preFeeValuePerEarn: bigint
  /** Scaled excess-fee target per EarnToken. */
  targetValuePerEarn: bigint
  /** Total fee liability, asset units. */
  totalFeeAssets: bigint
  /** EarnToken minted to cover the total fee. */
  totalFeeEarnAmount: bigint
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
  const [assetToken, earnToken] = await multicall(client, {
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
        functionName: 'earnToken',
      }),
    ],
    deployless: true,
  })
  const [assetAllowance, assetBalance, earnAllowance, earnBalance] =
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
          address: earnToken,
          abi: Abis.tip20,
          functionName: 'allowance',
          args: [account, vault],
        }),
        defineCall({
          address: earnToken,
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
    args: [earnBalance],
    functionName: 'previewRedeem',
  })
  return {
    assetAllowance,
    assetBalance,
    assetToken,
    earnAllowance,
    earnBalance,
    earnToken,
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
    earnAllowance: bigint
    /** Vault share balance held by the account. */
    earnBalance: bigint
    /** Token representing vault shares. */
    earnToken: Address
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
 *   earnAmount: 100_000_000n,
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
  const { earnAmount, vault, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...getRedeemQuote.call({ earnAmount, vault }),
  })
}

export namespace getRedeemQuote {
  export type Args = {
    /** Exact vault share input, base units. */
    earnAmount: bigint
    /** Vault address. */
    vault: Address
  }
  export type Parameters = Omit<ReadParameters, 'account'> & Args
  /** Asset output, including fees. */
  export type ReturnValue = ReadContractReturnType<
    typeof Abis.vaultAdapter,
    'previewRedeem',
    never
  >
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /**
   * Defines a call to the vault's `previewRedeem` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`multicall`](https://viem.sh/docs/contract/multicall): batch the call with other contract reads
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   *
   * @example
   * ```ts
   * import { Actions } from 'viem/tempo'
   *
   * const call = Actions.earn.getRedeemQuote.call({
   *   earnAmount: 100_000_000n,
   *   vault: '0x...',
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { earnAmount, vault } = args
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      args: [earnAmount],
      functionName: 'previewRedeem',
    })
  }
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
  const [engine, earnFees] = await Promise.all([
    readContract(client, {
      ...rest,
      abi: Abis.vaultAdapter,
      address: vault,
      functionName: 'engine',
    }),
    readContract(client, {
      ...rest,
      abi: Abis.vaultAdapter,
      address: vault,
      functionName: 'earnFees',
    }),
  ])
  const [
    assetToken,
    engine_,
    earnToken,
    operator,
    emergencyGuardian,
    asyncJanitor,
    engineMigrationMode,
    depositsPaused,
    engineShares,
    totalEarnSupply,
    isAccountingAligned,
    openRedeemRequestCount,
    feesActive,
    totalAssets,
    name,
    symbol,
    asyncRedeem,
    exactWithdraw,
    inKindDeposit,
    redeem,
  ] = await multicall(client, {
    ...rest,
    allowFailure: false,
    contracts: getVault.calls({ earnFees, engine, vault }),
    deployless: true,
  })
  if (!isAddressEqual(engine, engine_))
    throw new GetVaultEngineChangedError({ vault })
  return {
    assetToken,
    asyncJanitor,
    capabilities: { asyncRedeem, exactWithdraw, inKindDeposit, redeem },
    depositsPaused,
    emergencyGuardian,
    engine: { address: engine_, name, symbol, totalAssets },
    // `EngineMigrationMode`: 0 = UserOnly, 1 = OperatorEnabled.
    engineMigrationMode:
      engineMigrationMode === 0 ? 'userOnly' : 'operatorEnabled',
    engineShares,
    feesActive,
    isAccountingAligned,
    operator,
    openRedeemRequestCount,
    totalEarnSupply,
    earnToken,
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
      redeem: boolean
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
    isAccountingAligned: boolean
    /** Vault governance address. */
    operator: Address
    /** Open queued redemptions. */
    openRedeemRequestCount: bigint
    /** Active vault share supply. */
    totalEarnSupply: bigint
    /** Token representing vault shares. */
    earnToken: Address
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
  export function calls(args: Args & { earnFees: Address; engine: Address }) {
    const { earnFees, engine, vault } = args
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
        functionName: 'earnToken',
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
        functionName: 'totalEarnSupply',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'isAccountingAligned',
      }),
      defineCall({
        address: vault,
        abi: Abis.vaultAdapter,
        functionName: 'openRedeemRequestCount',
      }),
      defineCall({
        address: earnFees,
        abi: Abis.earnFees,
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
        args: [interfaceIds.redeem],
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
 * const earnAmount = await Actions.earn.getWithdrawQuote(client, {
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
    ...getWithdrawQuote.call({ assetAmount, vault }),
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
  export type ReturnValue = ReadContractReturnType<
    typeof Abis.vaultAdapter,
    'previewWithdraw',
    never
  >
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /**
   * Defines a call to the vault's `previewWithdraw` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`multicall`](https://viem.sh/docs/contract/multicall): batch the call with other contract reads
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   *
   * @example
   * ```ts
   * import { Actions } from 'viem/tempo'
   *
   * const call = Actions.earn.getWithdrawQuote.call({
   *   assetAmount: 250_000_000n,
   *   vault: '0x...',
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { assetAmount, vault } = args
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      args: [assetAmount],
      functionName: 'previewWithdraw',
    })
  }
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
 *   earnAmount: 100_000_000n,
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
    earnAmount: internal_Token.AmountInput
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
    const [args, earnToken] = await Promise.all([
      toRedeemArgs(client, parameters as never),
      readContract(client, {
        abi: Abis.vaultAdapter,
        address: parameters.vault,
        functionName: 'earnToken',
      }),
    ])
    return (await action(client, {
      ...parameters,
      calls: redeem.calls({ ...args, earnToken }),
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
      return EarnShares.minimumOutput(args.assetAmount, args.slippageBps)
    })()
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'redeem',
      args: [
        internal_Token.toBaseUnits(args.earnAmount, undefined),
        recipient,
        assetAmountMin,
      ],
    })
  }
  export namespace call {
    export type Args = {
      /** Vault shares to redeem; base units or `{ formatted, decimals? }`. */
      earnAmount: internal_Token.AmountInput
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
   * Pass `earnToken` explicitly because this builder performs no reads.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(
    args: call.Args & {
      /** Vault share token approved for the redemption. */
      earnToken: Address
    },
  ) {
    const { earnToken, vault } = args
    const earnAmount = internal_Token.toBaseUnits(args.earnAmount, undefined)
    return [
      defineCall({
        address: earnToken,
        abi: Abis.tip20,
        functionName: 'approve',
        args: [vault, earnAmount],
      }),
      redeem.call({ ...args, earnAmount }),
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
 *   earnAmount: 100_000_000n,
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
    earnAmount: args.earnAmount,
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
    earnAmount: bigint
  }>
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Withdraws vault shares from a Zone and redeems them on the parent chain. Use
 * {@link privateRedeem.prepare} to build the encrypted callback.
 *
 * @example
 * ```ts
 * const prepared = await Actions.earn.privateRedeem.prepare(parentClient, {
 *   earnRouter: '0x...',
 *   recipient: '0x...',
 *   recoveryRecipient: '0x...',
 *   earnAmount: 100_000_000n,
 *   slippageBps: 50,
 * })
 * const hash = await Actions.earn.privateRedeem(zoneClient, prepared)
 * ```
 *
 * @param client - Zone client.
 * @param parameters - Prepared redemption and transaction parameters.
 * @returns The transaction hash.
 */
export async function privateRedeem<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: privateRedeem.Parameters<chain, account>,
): Promise<privateRedeem.ReturnValue> {
  await assertPreparedZoneRequestChain(client, parameters)
  return zoneActions.requestWithdrawal(client, parameters)
}

export namespace privateRedeem {
  export type Args = prepare.ReturnValue
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args
  export type ReturnValue = SendTransactionReturnType
  export type ErrorType = zoneActions.requestWithdrawal.ErrorType

  /**
   * Builds an encrypted Zone withdrawal that redeems vault shares and returns
   * the resulting assets to the Zone.
   *
   * @param client - Parent-chain client.
   * @param parameters - Redemption intent and recovery parameters.
   * @returns The prepared withdrawal and correlation data.
   */
  export async function prepare<chain extends Chain | undefined>(
    client: Client<Transport, chain>,
    parameters: prepare.Parameters,
  ): Promise<prepare.ReturnValue> {
    const chainId = client.chain?.id
    if (!chainId) throw new Error('`chain` is required.')
    const {
      actionId = Hex.random(32),
      callbackGas = earnRouterCallbackGas,
      fallbackRecipient = parameters.recoveryRecipient,
      adapter,
      earnRouter,
      recipient,
      recoveryRecipient,
      returnMemo,
      earnAmount,
      withdrawalMemo,
      zoneId,
    } = parameters
    const readParameters = pickReadParameters(parameters)
    const [fromBlock, [vaultAsset, earnToken]] = await Promise.all([
      getBlockNumber(client, { cacheTime: 0 }),
      multicall(client, {
        ...readParameters,
        allowFailure: false,
        contracts: [
          defineCall({
            abi: Abis.vaultAdapter,
            address: adapter,
            functionName: 'asset',
          }),
          defineCall({
            abi: Abis.vaultAdapter,
            address: adapter,
            functionName: 'earnToken',
          }),
        ],
        deployless: true,
      }),
    ])
    const assetToken = parameters.assetToken ?? vaultAsset
    if (isAddressEqual(assetToken, earnToken))
      throw new Error('`assetToken` cannot be the adapter EarnToken.')

    const [{ encrypted, keyIndex }, assetAmountMin] = await Promise.all([
      zoneActions.encryptedDeposit.prepareRecipient(client, {
        ...readParameters,
        memo: returnMemo,
        portalAddress: parameters.portalAddress,
        recipient,
        zoneId,
      }),
      (async () => {
        if (parameters.assetAmountMin !== undefined)
          return EarnShares.minimumOutput(parameters.assetAmountMin, 0)
        if (parameters.assetAmount !== undefined)
          return EarnShares.minimumOutput(
            parameters.assetAmount,
            parameters.slippageBps,
          )
        const assetAmount = await getRedeemQuote(client, {
          ...readParameters,
          earnAmount,
          vault: adapter,
        })
        return EarnShares.minimumOutput(assetAmount, parameters.slippageBps)
      })(),
    ])
    const direct = isAddressEqual(assetToken, vaultAsset)
    const destinationData = encodeAbiParameters(Abis.earnRouterZoneReturn, [
      { encrypted, keyIndex, refundRecipient: recoveryRecipient },
    ])
    const data = encodeAbiParameters(Abis.earnRouterCallbackData, [
      {
        flow: 1,
        adapter,
        destination: 0,
        outputToken: assetToken,
        minVaultAssets: direct ? assetAmountMin : 1n,
        minEarnAmount: 0n,
        minOutputAmount: direct ? 0n : assetAmountMin,
        actionId,
        destinationData,
      },
    ])
    return {
      actionId,
      amount: earnAmount,
      callbackGas,
      chainId,
      data,
      fallbackRecipient,
      fromBlock,
      memo: withdrawalMemo,
      to: earnRouter,
      token: earnToken,
      zoneId,
    }
  }

  export namespace prepare {
    export type Parameters = Omit<ReadParameters, 'account'> &
      PrivatePreparationParameters & {
        /** Vault shares withdrawn from the Zone, base units. */
        earnAmount: bigint
      } & (
        | ({
            /** Asset token returned to the Zone. @default earnRouter vault asset */
            assetToken?: undefined
          } & OneOf<
            | {
                /** Minimum assets returned to the Zone. */
                assetAmountMin: bigint
              }
            | {
                /** Quoted assets returned to the Zone. */
                assetAmount: bigint
                /** Slippage tolerance under `assetAmount` (50 = 0.5%). */
                slippageBps: number
              }
            | {
                /** Slippage tolerance under a live vault quote (50 = 0.5%). */
                slippageBps: number
              }
          >)
        | ({
            /** Asset token returned to the Zone after a swap. */
            assetToken: Address
          } & MinimumAssetAmountParameters)
      )
    export type ReturnValue = PreparedZoneRequest
    export type ErrorType = BaseErrorType
  }

  /**
   * Defines the approval and Zone withdrawal calls for a prepared redemption.
   *
   * @param args - Prepared redemption arguments.
   * @returns The Zone withdrawal calls.
   */
  export function calls(args: Args) {
    return zoneActions.requestWithdrawal.calls(args)
  }
}

/**
 * Requests a private Zone redemption and waits for the Zone transaction
 * receipt. The receipt confirms withdrawal acceptance, not redemption.
 *
 * @param client - Zone client.
 * @param parameters - Prepared redemption and transaction parameters.
 * @returns The Zone transaction receipt and parent-chain withdrawal sender tag.
 */
export async function privateRedeemSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: privateRedeemSync.Parameters<chain, account>,
): Promise<privateRedeemSync.ReturnValue> {
  await assertPreparedZoneRequestChain(client, parameters)
  return zoneActions.requestWithdrawalSync(client, parameters)
}

export namespace privateRedeemSync {
  export type Args = privateRedeem.Args
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = privateRedeem.Parameters<chain, account> &
    WriteSyncParameters<chain, account>
  export type ReturnValue = zoneActions.requestWithdrawalSync.ReturnValue
  export type ErrorType = zoneActions.requestWithdrawalSync.ErrorType
}

/**
 * Waits for a Zone earnRouter redemption to complete on the parent chain.
 *
 * @example
 * ```ts
 * const result = await Actions.earn.waitForPrivateRedeem(parentClient, {
 *   actionId: prepared.actionId,
 *   fromBlock: prepared.fromBlock,
 *   earnRouter: '0x...',
 * })
 * ```
 *
 * @param client - Parent-chain client.
 * @param parameters - Prepared action correlation and polling parameters.
 * @returns The completed earnRouter redemption.
 */
export async function waitForPrivateRedeem<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: waitForPrivateRedeem.Parameters,
): Promise<waitForPrivateRedeem.ReturnType> {
  const {
    actionId,
    fromBlock,
    earnRouter,
    pollingInterval = client.pollingInterval,
    timeout = 60_000,
  } = parameters
  const event = getAbiItem({
    abi: Abis.earnRouter,
    name: 'EarnRedeem',
  })
  const observerId = stringify([
    'waitForPrivateRedeem',
    client.uid,
    earnRouter,
    actionId,
    fromBlock,
  ])
  const { promise, reject, resolve } =
    withResolvers<waitForPrivateRedeem.ReturnType>()

  let timer: ReturnType<typeof setTimeout> | undefined
  let unobserve: () => void
  const cleanup = () => {
    clearTimeout(timer)
    unobserve()
  }
  const resolve_ = (result: waitForPrivateRedeem.ReturnType) => {
    cleanup()
    resolve(result)
  }
  const reject_ = (error: unknown) => {
    cleanup()
    reject(error)
  }

  unobserve = observe(
    observerId,
    { reject: reject_, resolve: resolve_ },
    (emit) => {
      const unpoll = poll(
        async () => {
          try {
            const [log] = await getLogs(client, {
              address: earnRouter,
              args: { actionId },
              event,
              fromBlock,
              strict: true,
              toBlock: 'latest',
            })
            if (!log) return
            unpoll()
            emit.resolve({
              actionId: log.args.actionId,
              outputAmount: log.args.outputAmount,
              outputToken: log.args.outputToken,
              earnAmount: log.args.earnAmount,
              tempoBlockNumber: log.blockNumber,
              vaultAssets: log.args.vaultAssets,
              zoneDepositHash: log.args.zoneDepositHash,
            })
          } catch (error) {
            unpoll()
            emit.reject(error)
          }
        },
        { emitOnBegin: true, interval: pollingInterval },
      )

      return unpoll
    },
  )

  timer = timeout
    ? setTimeout(() => {
        reject_(new WaitForPrivateRedeemTimeoutError({ actionId, earnRouter }))
      }, timeout)
    : undefined

  return await promise
}

export namespace waitForPrivateRedeem {
  export type Parameters = {
    /** Correlation id from {@link privateRedeem.prepare}. */
    actionId: Hex.Hex
    /** Lower bound for the parent-chain log scan. */
    fromBlock: bigint
    /** Zone earnRouter address. */
    earnRouter: Address
    /** Polling frequency in milliseconds. @default `client.pollingInterval` */
    pollingInterval?: number | undefined
    /** Timeout in milliseconds; `0` disables it. @default `60_000` */
    timeout?: number | undefined
  }
  export type ReturnType = {
    /** Correlation id for the completed redemption. */
    actionId: Hex.Hex
    /** Tokens returned to the Zone, base units. */
    outputAmount: bigint
    /** Token returned to the Zone. */
    outputToken: Address
    /** EarnToken redeemed. */
    earnAmount: bigint
    /** Parent-chain block containing the earnRouter event. */
    tempoBlockNumber: bigint
    /** Vault assets produced before any swap. */
    vaultAssets: bigint
    /** Encrypted return deposit hash. */
    zoneDepositHash: Hex.Hex
  }
  export type ErrorType =
    | GetLogsErrorType
    | ObserveErrorType
    | PollErrorType
    | WaitForPrivateRedeemTimeoutErrorType
    | BaseErrorType
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
        earnAmountMax: bigint
      }
    | {
        /** Slippage headroom above a live {@link getWithdrawQuote}, ceiling-rounded (50 = 0.5%). */
        slippageBps: number
      }
    | {
        /** Quoted vault share input; raised by `slippageBps`. */
        earnAmount: bigint
        /** Slippage tolerance in basis points over `earnAmount` (50 = 0.5%). */
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
    const [args, earnToken] = await Promise.all([
      toWithdrawExactArgs(client, parameters as never),
      readContract(client, {
        abi: Abis.vaultAdapter,
        address: parameters.vault,
        functionName: 'earnToken',
      }),
    ])
    return (await action(client, {
      ...parameters,
      calls: withdrawExact.calls({ ...args, earnToken }),
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
    const earnAmountMax = (() => {
      if (args.earnAmountMax !== undefined) return args.earnAmountMax
      return maximumInput(args.earnAmount, args.slippageBps)
    })()
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      functionName: 'withdrawExact',
      args: [
        internal_Token.toBaseUnits(args.assetAmount, undefined),
        recipient,
        earnAmountMax,
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
          earnAmountMax: bigint
        }
      | {
          /** Quoted vault share input; raised by `slippageBps`. */
          earnAmount: bigint
          /** Slippage tolerance in basis points over `earnAmount` (50 = 0.5%). */
          slippageBps: number
        }
    >
  }

  /**
   * Defines the vault share approval and withdrawal calls for atomic
   * execution. Pass `earnToken` explicitly because this builder performs no reads.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(
    args: call.Args & {
      /** Vault share token approved for the withdrawal. */
      earnToken: Address
    },
  ) {
    const { earnToken, vault } = args
    const assetAmount = internal_Token.toBaseUnits(args.assetAmount, undefined)
    const call = withdrawExact.call({ ...args, assetAmount })
    const [, , earnAmountMax] = call.args
    return [
      defineCall({
        address: earnToken,
        abi: Abis.tip20,
        functionName: 'approve',
        args: [vault, earnAmountMax],
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
 * const { earnAmount } = await Actions.earn.withdrawExactSync(client, {
 *   assetAmount: 40_000_000n,
 *   earnAmountMax: 40_200_000n,
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
    earnAmount: args.earnAmountBurned,
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
    earnAmount: bigint
  }>
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

type MinimumAssetAmountParameters = OneOf<
  | {
      /** Minimum assets returned to the Zone. */
      assetAmountMin: bigint
    }
  | {
      /** Quoted assets returned to the Zone. */
      assetAmount: bigint
      /** Slippage tolerance under `assetAmount` (50 = 0.5%). */
      slippageBps: number
    }
>

type MinimumEarnAmountParameters = OneOf<
  | {
      /** Minimum vault shares returned to the Zone. */
      earnAmountMin: bigint
    }
  | {
      /** Quoted vault shares returned to the Zone. */
      earnAmount: bigint
      /** Slippage tolerance under `earnAmount` (50 = 0.5%). */
      slippageBps: number
    }
>

type PrivatePreparationParameters = {
  /** Optional caller-supplied correlation id. @default Random bytes32 */
  actionId?: Hex.Hex | undefined
  /** Target VaultAdapter. */
  adapter: Address
  /** Gas reserved for the parent-chain callback. @default `10_000_000n` */
  callbackGas?: bigint | undefined
  /** Public recipient if the parent-chain callback fails. @default `recoveryRecipient` */
  fallbackRecipient?: Address | undefined
  /** Network-level universal EarnRouter. */
  earnRouter: Address
  /** Canonical source Zone portal. @default resolved from `chain` and `zoneId` */
  portalAddress?: Address | undefined
  /** Encrypted recipient for the returned tokens. */
  recipient: Address
  /** Public recipient if the encrypted return fails. */
  recoveryRecipient: Address
  /** Optional memo encrypted with the returned Zone deposit. */
  returnMemo?: Hex.Hex | undefined
  /** Optional memo attached to the Zone withdrawal. */
  withdrawalMemo?: Hex.Hex | undefined
  /** Source and return Zone ID. */
  zoneId: number
}

type PreparedZoneRequest = {
  /** Correlation id for the matching wait action. */
  actionId: Hex.Hex
  /** Withdrawal amount, passed through to the Zone action. */
  amount: bigint
  /** Gas reserved for the parent-chain callback. */
  callbackGas: bigint
  /** Parent chain containing the earnRouter. */
  chainId: number
  /** Encoded earnRouter callback. */
  data: Hex.Hex
  /** Public recipient if the parent-chain callback fails. */
  fallbackRecipient: Address
  /** Parent-chain block before the withdrawal is submitted. */
  fromBlock: bigint
  /** Optional memo attached to the Zone withdrawal. */
  memo?: Hex.Hex | undefined
  /** Zone earnRouter receiving the withdrawal. */
  to: Address
  /** Token withdrawn from the Zone. */
  token: Address
  /** Zone containing the withdrawn tokens. */
  zoneId: number
}

const earnRouterCallbackGas = 10_000_000n

function resolveMinimumEarnAmount(parameters: MinimumEarnAmountParameters) {
  if (parameters.earnAmountMin !== undefined)
    return EarnShares.minimumOutput(parameters.earnAmountMin, 0)
  return EarnShares.minimumOutput(parameters.earnAmount, parameters.slippageBps)
}

async function assertPreparedZoneRequestChain(
  client: Client<Transport, Chain | undefined>,
  parameters: PreparedZoneRequest,
) {
  const chain = client.chain
  if (!chain) throw new Error('`chain` is required.')
  if (chain.sourceId !== parameters.chainId)
    throw new Error(
      'Prepared Zone request parent chain ID does not match client chain.',
    )
  const { zoneId } = await zoneActions.getZoneInfo(client)
  if (zoneId !== parameters.zoneId)
    throw new Error(
      'Prepared Zone request Zone ID does not match client chain.',
    )
}

function pickReadParameters(parameters: Omit<ReadParameters, 'account'>) {
  const { blockOverrides, stateOverride } = parameters
  if (parameters.blockNumber !== undefined)
    return {
      blockNumber: parameters.blockNumber,
      blockOverrides,
      stateOverride,
    }
  return { blockOverrides, blockTag: parameters.blockTag, stateOverride }
}

// ERC-165 ids of the optional engine capability interfaces (XOR of each
// interface's function selectors).
const interfaceIds = {
  /** `IVaultEngineAsyncRedeem`. */
  asyncRedeem: '0xa1a6a1d7',
  /** `IVaultEngineExactWithdraw`. */
  exactWithdraw: '0x0adfb0b9',
  /** `IVaultEngineInKindDeposit`. */
  inKindDeposit: '0xce4790a9',
  /** `IVaultEngineRedeem`. */
  redeem: '0x94a2d467',
} as const

/** Trims the decoded `EarnFees.FeeConfig` to its active fixed-fee count. */
function toFeeConfig(
  config: ReadContractReturnType<typeof Abis.earnFees, 'feeConfig'>,
): FeeConfig {
  return {
    excess: config.excess,
    fixedFees: config.fixedFees.slice(0, config.fixedFeeCount),
  }
}

/** Trims the decoded `EarnFees.FeePreview` to its active allocation count. */
function toFeePreview(
  preview: ReadContractReturnType<typeof Abis.earnFees, 'previewAccruedFees'>,
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
  if (parameters.earnAmountMin !== undefined)
    return { ...args, earnAmountMin: parameters.earnAmountMin }
  return {
    ...args,
    earnAmount: parameters.earnAmount,
    slippageBps: parameters.slippageBps,
  }
}

/** Resolves `depositVenueShares` parameters into the adapter call args. @internal */
function toDepositVenueSharesArgs(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: depositVenueShares.Parameters,
): depositVenueShares.call.Args {
  const { vault, venueShares } = parameters
  const args = {
    recipient: resolveRecipient(client, parameters),
    vault,
    venueShares,
  }
  if (parameters.earnAmountMin !== undefined)
    return { ...args, earnAmountMin: parameters.earnAmountMin }
  return {
    ...args,
    earnAmount: parameters.earnAmount,
    slippageBps: parameters.slippageBps,
  }
}

/** Resolves `redeem` parameters into the adapter call args. @internal */
async function toRedeemArgs(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: redeem.Parameters,
): Promise<redeem.call.Args> {
  const { vault } = parameters
  const earnAmount = await toBaseUnitsLive(client, {
    amount: parameters.earnAmount,
    token: 'earnToken',
    vault,
  })
  const args = {
    recipient: resolveRecipient(client, parameters),
    earnAmount,
    vault,
  }
  if (parameters.assetAmountMin !== undefined)
    return { ...args, assetAmountMin: parameters.assetAmountMin }
  const assetAmount = await (async () => {
    if (parameters.assetAmount !== undefined) return parameters.assetAmount
    return getRedeemQuote(client, { earnAmount, vault })
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
  if (parameters.earnAmountMax !== undefined)
    return { ...args, earnAmountMax: parameters.earnAmountMax }
  const earnAmount = await (async () => {
    if (parameters.earnAmount !== undefined) return parameters.earnAmount
    return getWithdrawQuote(client, { assetAmount, vault })
  })()
  return {
    ...args,
    earnAmount,
    slippageBps: parameters.slippageBps,
  }
}

/** Raises a quoted input by basis points with ceiling rounding. @internal */
function maximumInput(earnAmount: bigint, slippageBps: number): bigint {
  if (earnAmount <= 0n)
    throw new EarnShares.InvalidExpectedOutputError({
      expectedAmount: earnAmount,
    })
  if (
    !Number.isInteger(slippageBps) ||
    slippageBps < 0 ||
    slippageBps >= EarnShares.basisPointScale
  )
    throw new EarnShares.InvalidSlippageError({ slippageBps })
  const scale = BigInt(EarnShares.basisPointScale)
  const numerator = earnAmount * (scale + BigInt(slippageBps))
  // Adding the denominator minus one converts floor division to ceiling.
  return (numerator + scale - 1n) / scale
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
    token: 'asset' | 'earnToken'
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
