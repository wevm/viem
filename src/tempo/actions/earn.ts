import { AbiEvent, AbiParameters, Address, Hex } from 'ox'
import type { Errors, Log } from 'ox'
import { EarnShares } from 'ox/tempo'

import * as Account from '../../core/Account.js'
import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { getNumber } from '../../core/actions/block/getNumber.js'
import { read } from '../../core/actions/contract/read.js'
import type { simulate as simulateContract } from '../../core/actions/contract/simulate.js'
import { writeSync } from '../../core/actions/contract/writeSync.js'
import { getLogs } from '../../core/actions/event/getLogs.js'
import { multicall } from '../../core/actions/multicall.js'
import * as internal_Token from '../../core/actions/token/internal.js'
import { send } from '../../core/actions/transaction/send.js'
import { sendSync } from '../../core/actions/transaction/sendSync.js'
import { type ObserveErrorType, observe } from '../../core/internal/observe.js'
import { type PollErrorType, poll } from '../../core/internal/poll.js'
import { withResolvers } from '../../core/internal/promise.js'
import type { Compute, OneOf } from '../../core/internal/types.js'
import { stringify } from '../../core/internal/stringify.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import {
  GetVaultEngineChangedError,
  WaitForPrivateDepositTimeoutError,
  WaitForPrivateRedeemTimeoutError,
} from '../errors.js'
import type {
  ReadParameters,
  WriteParameters,
  WriteSyncParameters,
} from '../internal/types.js'
import {
  type CallParameters,
  defineCall,
  dispatchSend,
  dispatchWrite,
  estimateWrite,
  pickWriteParameters,
  pickWriteSyncParameters,
  resolveCallParameters,
  resolveTokenWithDecimals,
  simulateWrite,
} from '../internal/utils.js'
import * as policyActions from './policy/index.js'
import * as tokenActions from './token/index.js'
import * as zoneActions from './zone/index.js'

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
  eligibilityPolicy: writeSync.ReturnType
  /** Compound policy creation receipt. */
  compoundPolicy: writeSync.ReturnType
  /** Vault share token policy update receipt. */
  tokenPolicy: writeSync.ReturnType
  /** Eligibility policy admin transfer receipt, when an administrator is provided. */
  policyAdmin?: writeSync.ReturnType | undefined
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
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const account = Account.fromSecp256k1('0x…')
 * const client = Client.create({
 *   account,
 *   transport: http(),
 * })
 *
 * const { policy, receipts } =
 *   await Actions.earn.configureExitSafePolicy(client, {
 *     accessAdministrator: '0x…',
 *     initialMembers: ['0x…', '0x…'],
 *     shareToken: '0x…',
 *   })
 * ```
 *
 * @param client - Client authorized to change the vault share token policy.
 * @param options - Share token, administrator, and initial members.
 * @returns The configured policy IDs and transaction receipts.
 */
export async function configureExitSafePolicy<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: configureExitSafePolicy.Options<account>,
): Promise<configureExitSafePolicy.ReturnType> {
  const account_ = options.account ?? client.account
  if (!account_) throw new Account.NotFoundError()
  const account = Account.from(account_)
  const initialMembers = [
    ...new Set(
      options.initialMembers.map((member) => Address.checksum(member)),
    ),
  ]
  if (initialMembers.length === 0)
    throw new Error('At least one initial policy member is required.')

  const eligibility = await policyActions.createSync(client, {
    account,
    addresses: initialMembers,
    admin: account,
    chain: client.chain,
    type: 'whitelist',
  })
  const compoundPolicy = await dispatchWrite(writeSync, client, {
    account,
    abi: Abis.tip403Registry,
    address: Addresses.tip403Registry,
    args: [alwaysAllowPolicyId, eligibility.policyId, eligibility.policyId],
    chain: client.chain,
    functionName: 'createCompoundPolicy',
    throwOnReceiptRevert: true,
  })
  const [compoundEvent] = AbiEvent.extractLogs(
    Abis.tip403Registry,
    compoundPolicy.logs,
    {
      eventName: 'CompoundPolicyCreated',
      strict: true,
    },
  )
  if (!compoundEvent)
    throw new Error('`CompoundPolicyCreated` event not found.')

  const tokenPolicy = await tokenActions.changeTransferPolicySync(client, {
    account,
    chain: client.chain,
    policyId: compoundEvent.args.policyId,
    token: options.shareToken,
  })
  const policyAdmin = Address.isEqual(
    options.accessAdministrator,
    account.address,
  )
    ? undefined
    : await policyActions.setAdminSync(client, {
        account,
        admin: options.accessAdministrator,
        chain: client.chain,
        policyId: eligibility.policyId,
      })

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
    accessAdministrator: Address.Address
    /** Addresses initially eligible to receive or be minted vault shares. */
    initialMembers: readonly Address.Address[]
    /** Earn vault share token. */
    shareToken: Address.Address
  }
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = AccountParameter<account> & Args
  export type ReturnType = Compute<{
    /** Configured onchain policy IDs. */
    policy: ExitSafePolicy
    /** Receipts for each configuration transaction. */
    receipts: ExitSafePolicyReceipts
  }>
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}

/**
 * Verifies that an Earn vault share token uses the expected exit-safe TIP-403
 * policy and that every required member can receive transfers and mints.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * })
 *
 * await Actions.earn.validateExitSafePolicy(client, {
 *   accessAdministrator: '0x…',
 *   policy: {
 *     transferPolicyId: 3n,
 *     senderPolicyId: 1n,
 *     recipientPolicyId: 2n,
 *     mintRecipientPolicyId: 2n,
 *   },
 *   requiredMembers: ['0x…', '0x…'],
 *   shareToken: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Expected policy, administrator, and required members.
 * @returns Nothing when the policy is valid.
 */
export async function validateExitSafePolicy<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: validateExitSafePolicy.Options,
): Promise<validateExitSafePolicy.ReturnType> {
  const { accessAdministrator, policy, requiredMembers, shareToken, ...rest } =
    options
  const [tokenPolicyId, compound, simplePolicy, memberResults] =
    await Promise.all([
      read(client, {
        ...rest,
        abi: Abis.tip20,
        address: shareToken,
        functionName: 'transferPolicyId',
      }),
      read(client, {
        ...rest,
        abi: Abis.tip403Registry,
        address: Addresses.tip403Registry,
        args: [policy.transferPolicyId],
        functionName: 'compoundPolicyData',
      }),
      read(client, {
        ...rest,
        abi: Abis.tip403Registry,
        address: Addresses.tip403Registry,
        args: [policy.recipientPolicyId],
        functionName: 'policyData',
      }),
      Promise.all(
        requiredMembers.map(async (member) => {
          const [recipient, mintRecipient] = await Promise.all([
            read(client, {
              ...rest,
              abi: Abis.tip403Registry,
              address: Addresses.tip403Registry,
              args: [policy.transferPolicyId, member],
              functionName: 'isAuthorizedRecipient',
            }),
            read(client, {
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
    compound.senderPolicyId !== policy.senderPolicyId ||
    compound.recipientPolicyId !== policy.recipientPolicyId ||
    compound.mintRecipientPolicyId !== policy.mintRecipientPolicyId
  )
    throw new Error('TIP-403 compound policy components mismatch.')
  if (policy.senderPolicyId !== alwaysAllowPolicyId)
    throw new Error('TIP-403 sender policy is not always allow.')
  if (policy.recipientPolicyId !== policy.mintRecipientPolicyId)
    throw new Error('TIP-403 recipient and mint-recipient policies must match.')
  if (simplePolicy.policyType !== 0)
    throw new Error('TIP-403 eligibility policy is not a whitelist.')
  if (!Address.isEqual(simplePolicy.admin, accessAdministrator))
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
    accessAdministrator: Address.Address
    /** Expected exit-safe policy IDs. */
    policy: ExitSafePolicy
    /** Addresses that must be eligible to receive or be minted vault shares. */
    requiredMembers: readonly Address.Address[]
    /** Earn vault share token. */
    shareToken: Address.Address
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = void
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}

/**
 * Deposits assets into a vault and mints vault shares to `recipient`. The
 * transaction includes the required asset approval.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.earn.deposit(client, {
 *   assetAmount: 100_000_000n,
 *   shareAmount: 99_900_000n,
 *   slippageBps: 50,
 *   vault: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function deposit<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: deposit.Options,
): Promise<deposit.ReturnType> {
  return deposit.inner(send, client, options)
}

export namespace deposit {
  export type Args = {
    /** Assets to deposit; base units or `{ formatted, decimals? }` (asset decimals). */
    assetAmount: internal_Token.AmountInput
    /** Vault share recipient. @default `account.address` */
    recipient?: Address.Address | undefined
    /** Vault address. */
    vault: Address.Address
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
  export type Options = WriteParameters & Args
  export type ReturnType = send.ReturnType
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal Shared dispatch; reads the asset for the approval. */
  export async function inner<
    action extends typeof send | typeof sendSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    options: deposit.Options,
  ): Promise<dispatchSend.ReturnType<action>> {
    const [args, assetToken] = await Promise.all([
      toDepositArgs(client, options),
      read(client, {
        abi: Abis.vaultAdapter,
        address: options.vault,
        functionName: 'asset',
      }),
    ])
    return dispatchSend(action, client, {
      ...pickWriteParameters(options),
      ...(action === sendSync ? pickWriteSyncParameters(options) : {}),
      calls: deposit.calls({ ...args, assetToken }),
    })
  }

  /**
   * Defines a deposit call without an approval. Provide token decimals for
   * formatted inputs and an explicit output bound because this builder performs no reads.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<call.Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { recipient, vault } = args
    const shareAmountMin = (() => {
      if (args.shareAmountMin !== undefined) return args.shareAmountMin
      return EarnShares.minimumOutput(args.shareAmount, args.slippageBps)
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
      recipient: Address.Address
      /** Vault address. */
      vault: Address.Address
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
      assetToken: Address.Address
    },
  ) {
    const { assetToken, vault } = args
    const assetAmount = internal_Token.toBaseUnits(args.assetAmount, undefined)
    return [
      defineCall({
        address: assetToken,
        abi: Abis.tip20,
        functionName: 'approve',
        args: [vault, assetAmount],
      }),
      deposit.call({ ...args, assetAmount }),
    ] as const
  }

  /**
   * Extracts a `Deposited` event from the vault's logs.
   *
   * @param logs - Logs.
   * @param options - Options.
   * @returns The `Deposited` event.
   */
  export function extractEvent(
    logs: readonly Log.Log[],
    options: { vault: Address.Address },
  ) {
    const { vault } = options
    // Earn contracts are user-deployed: several adapters can emit the same
    // signature in one receipt, so filter by emitting address before decode.
    const [log] = AbiEvent.extractLogs(
      Abis.vaultAdapter,
      logs.filter((log) => Address.isEqual(log.address, vault)),
      { eventName: 'Deposited', strict: true },
    )
    if (!log) throw new Error('`Deposited` event not found.')
    return log
  }

  /**
   * Estimates gas for a deposit, assuming the vault has enough asset allowance.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: deposit.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...deposit.call(await toDepositArgs(client, options)),
    })
  }

  /**
   * Simulates a deposit, assuming the vault has enough asset allowance.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: deposit.Options,
  ): Promise<simulateContract.ReturnType<typeof Abis.vaultAdapter, 'deposit'>> {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...deposit.call(await toDepositArgs(client, options)),
    })
  }
}

/**
 * Deposits assets and returns the confirmed receipt and event data.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, EarnShares, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const { shareAmount } = await Actions.earn.depositSync(client, {
 *   assetAmount: 100_000_000n,
 *   shareAmountMin: EarnShares.minimumOutput(99_900_000n, 50),
 *   vault: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function depositSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: depositSync.Options,
): Promise<depositSync.ReturnType> {
  const { throwOnReceiptRevert = true, vault } = options
  const receipt = await deposit.inner(sendSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
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
  export type Options = deposit.Options & WriteSyncParameters
  export type ReturnType = Compute<{
    /** Assets deposited. */
    assetAmount: bigint
    /** Depositing caller. */
    caller: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
    /** Vault share recipient. */
    recipient: Address.Address
    /** Vault shares minted. */
    shareAmount: bigint
  }>
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}

/**
 * Deposits venue shares into a vault and mints vault shares to `recipient`.
 * The transaction includes the required venue share approval.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.earn.depositShares(client, {
 *   earnShareAmount: 499_000_000n,
 *   slippageBps: 30,
 *   vault: '0x…',
 *   venueShareAmount: 500_000_000n,
 *   venueShareToken: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function depositShares<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: depositShares.Options,
): Promise<depositShares.ReturnType> {
  return depositShares.inner(send, client, options)
}

export namespace depositShares {
  export type Args = {
    /** Venue shares to deposit, base units. */
    venueShareAmount: bigint
    /** Vault share recipient. @default `account.address` */
    recipient?: Address.Address | undefined
    /** Vault address. */
    vault: Address.Address
    /** Venue share token approved for the deposit. */
    venueShareToken: Address.Address
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
  export type Options = WriteParameters & Args
  export type ReturnType = send.ReturnType
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal Shared dispatch; reads the engine for the approval. */
  export async function inner<
    action extends typeof send | typeof sendSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    options: depositShares.Options,
  ): Promise<dispatchSend.ReturnType<action>> {
    const engine = await read(client, {
      abi: Abis.vaultAdapter,
      address: options.vault,
      functionName: 'engine',
    })
    return dispatchSend(action, client, {
      ...pickWriteParameters(options),
      ...(action === sendSync ? pickWriteSyncParameters(options) : {}),
      calls: depositShares.calls({
        ...toDepositSharesArgs(client, options),
        engine,
        venueShareToken: options.venueShareToken,
      }),
    })
  }

  /**
   * Defines a venue share deposit call without an approval. Provide an
   * explicit output bound because this builder performs no reads.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<call.Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { recipient, vault, venueShareAmount } = args
    const earnShareAmountMin = (() => {
      if (args.earnShareAmountMin !== undefined) return args.earnShareAmountMin
      return EarnShares.minimumOutput(args.earnShareAmount, args.slippageBps)
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
      recipient: Address.Address
      /** Vault address. */
      vault: Address.Address
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
      engine: Address.Address
      /** Venue share token pulled by the engine. */
      venueShareToken: Address.Address
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
    ] as const
  }

  /**
   * Extracts a `VenueSharesDeposited` event from the vault's logs.
   *
   * @param logs - Logs.
   * @param options - Options.
   * @returns The `VenueSharesDeposited` event.
   */
  export function extractEvent(
    logs: readonly Log.Log[],
    options: { vault: Address.Address },
  ) {
    const { vault } = options
    // Earn contracts are user-deployed: several adapters can emit the same
    // signature in one receipt, so filter by emitting address before decode.
    const [log] = AbiEvent.extractLogs(
      Abis.vaultAdapter,
      logs.filter((log) => Address.isEqual(log.address, vault)),
      { eventName: 'VenueSharesDeposited', strict: true },
    )
    if (!log) throw new Error('`VenueSharesDeposited` event not found.')
    return log
  }

  /**
   * Estimates gas for a venue share deposit, assuming enough allowance.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: depositShares.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...depositShares.call(toDepositSharesArgs(client, options)),
    })
  }

  /**
   * Simulates a venue share deposit, assuming enough allowance.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: depositShares.Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.vaultAdapter, 'depositShares'>
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...depositShares.call(toDepositSharesArgs(client, options)),
    })
  }
}

/**
 * Deposits venue shares and returns the confirmed receipt and event data.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, EarnShares, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const { earnShareAmount } = await Actions.earn.depositSharesSync(client, {
 *   earnShareAmount: 499_000_000n,
 *   slippageBps: 30,
 *   vault: '0x…',
 *   venueShareAmount: 500_000_000n,
 *   venueShareToken: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function depositSharesSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: depositSharesSync.Options,
): Promise<depositSharesSync.ReturnType> {
  const { throwOnReceiptRevert = true, vault } = options
  const receipt = await depositShares.inner(sendSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
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
  export type Options = depositShares.Options & WriteSyncParameters
  export type ReturnType = Compute<{
    /** Depositing caller. */
    caller: Address.Address
    /** Vault shares minted. */
    earnShareAmount: bigint
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
    /** Venue shares measured as received by the engine. */
    receivedVenueShareAmount: bigint
    /** Vault share recipient. */
    recipient: Address.Address
    /** Venue shares requested for pull. */
    venueShareAmount: bigint
  }>
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}

/**
 * Withdraws assets from a Zone and deposits them into a vault on the parent
 * chain. Use {@link privateDeposit.prepare} to build the encrypted callback.
 *
 * @example
 * ```ts
 * const prepared = await Actions.earn.privateDeposit.prepare(parentClient, {
 *   assetAmount: 100_000_000n,
 *   assetToken: '0x…',
 *   gateway: '0x…',
 *   recipient: '0x…',
 *   recoveryRecipient: '0x…',
 *   shareAmountMin: 99_500_000n,
 *   vaultAssetAmountMin: 99_000_000n,
 * })
 * const hash = await Actions.earn.privateDeposit(zoneClient, prepared)
 * ```
 *
 * @param client - Zone client.
 * @param options - Prepared deposit and transaction options.
 * @returns The transaction hash.
 */
export async function privateDeposit<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: privateDeposit.Options<account>,
): Promise<privateDeposit.ReturnType> {
  await assertPreparedZoneRequestChain(client, options)
  return zoneActions.requestWithdrawal(client, options)
}

export namespace privateDeposit {
  export type Args = prepare.ReturnType
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = zoneActions.requestWithdrawal.Options<account> & Args
  export type ReturnType = send.ReturnType
  export type ErrorType = zoneActions.requestWithdrawal.ErrorType

  /**
   * Builds an encrypted Zone withdrawal that deposits into the gateway's
   * vault and returns the resulting shares to the Zone.
   *
   * @param client - Parent-chain client.
   * @param options - Deposit intent and recovery options.
   * @returns The prepared withdrawal and correlation data.
   */
  export async function prepare<chain extends Chain.Chain | undefined>(
    client: Client.Client<chain>,
    options: prepare.Options,
  ): Promise<prepare.ReturnType> {
    const chainId = client.chain?.id
    if (!chainId) throw new Error('`chain` is required.')
    const {
      actionId = Hex.random(32),
      assetAmount,
      callbackGas = zoneGatewayCallbackGas,
      fallbackRecipient = options.recoveryRecipient,
      gateway,
      recipient,
      recoveryRecipient,
      returnMemo,
      withdrawalMemo,
    } = options
    const readParameters = pickReadParameters(options)
    const [fromBlock, config] = await Promise.all([
      getNumber(client, { cacheTime: 0 }),
      getZoneGatewayConfig(client, { ...readParameters, gateway }),
    ])
    const assetToken = options.assetToken ?? config.vaultAsset
    const { encrypted, keyIndex } =
      await zoneActions.encryptedDeposit.prepareRecipient(client, {
        ...readParameters,
        memo: returnMemo,
        portalAddress: config.zonePortal,
        recipient,
        zoneId: config.zoneId,
      })
    const shareAmountMin = resolveMinimumShareAmount(options)
    const direct = Address.isEqual(assetToken, config.vaultAsset)
    const data = AbiParameters.encode(Abis.zoneGatewayCallbackData, [
      {
        flow: 0,
        outputToken: config.shareToken,
        keyIndex,
        encrypted,
        minVaultAssets: direct
          ? assetAmount
          : (options.vaultAssetAmountMin ?? 0n),
        minVaultShares: shareAmountMin,
        minOutputAmount: 0n,
        actionId,
        refundRecipient: recoveryRecipient,
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
      to: gateway,
      token: assetToken,
      zoneId: config.zoneId,
    }
  }

  export namespace prepare {
    export type Options = MulticallReadParameters & Args
    export type Args = PrivatePreparationParameters & {
      /** Assets withdrawn from the Zone, base units. */
      assetAmount: bigint
      /** Asset token withdrawn from the Zone. @default gateway vault asset */
      assetToken?: Address.Address | undefined
      /** Minimum gateway vault assets accepted after swapping `assetToken`. @default `0n` */
      vaultAssetAmountMin?: bigint | undefined
    } & MinimumShareAmountParameters
    export type ReturnType = PreparedZoneRequest
    export type ErrorType = Errors.GlobalErrorType
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
 * @param options - Prepared deposit and transaction options.
 * @returns The Zone transaction receipt and parent-chain withdrawal sender tag.
 */
export async function privateDepositSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: privateDepositSync.Options<account>,
): Promise<privateDepositSync.ReturnType> {
  await assertPreparedZoneRequestChain(client, options)
  return zoneActions.requestWithdrawalSync(client, options)
}

export namespace privateDepositSync {
  export type Args = privateDeposit.Args
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = privateDeposit.Options<account> & WriteSyncParameters
  export type ReturnType = zoneActions.requestWithdrawalSync.ReturnType
  export type ErrorType = zoneActions.requestWithdrawalSync.ErrorType
}

/**
 * Waits for a Zone gateway deposit to complete on the parent chain.
 *
 * @example
 * ```ts
 * const result = await Actions.earn.waitForPrivateDeposit(parentClient, {
 *   actionId: prepared.actionId,
 *   fromBlock: prepared.fromBlock,
 *   gateway: '0x…',
 * })
 * ```
 *
 * @param client - Parent-chain client.
 * @param options - Prepared action correlation and polling options.
 * @returns The completed gateway deposit.
 */
export async function waitForPrivateDeposit<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: waitForPrivateDeposit.Options,
): Promise<waitForPrivateDeposit.ReturnType> {
  const {
    actionId,
    fromBlock,
    gateway,
    pollingInterval = client.pollingInterval,
    timeout = 60_000,
  } = options
  const event = AbiEvent.fromAbi(Abis.zoneGateway, 'EarnDeposit')
  const observerId = stringify([
    'waitForPrivateDeposit',
    client.uid,
    gateway,
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
              address: gateway,
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
              shares: log.args.shares,
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
        reject_(new WaitForPrivateDepositTimeoutError({ actionId, gateway }))
      }, timeout)
    : undefined

  return await promise
}

export namespace waitForPrivateDeposit {
  export type Options = {
    /** Correlation id from {@link privateDeposit.prepare}. */
    actionId: Hex.Hex
    /** Lower bound for the parent-chain log scan. */
    fromBlock: bigint
    /** Zone gateway address. */
    gateway: Address.Address
    /** Polling frequency in milliseconds. @default `client.pollingInterval` */
    pollingInterval?: number | undefined
    /** Timeout in milliseconds; `0` disables it. @default `60_000` */
    timeout?: number | undefined
  }
  export type ReturnType = {
    /** Correlation id for the completed deposit. */
    actionId: Hex.Hex
    /** Tokens delivered to the gateway, base units. */
    inputAmount: bigint
    /** Token delivered to the gateway. */
    inputToken: Address.Address
    /** Vault shares returned to the Zone. */
    shares: bigint
    /** Parent-chain block containing the gateway event. */
    tempoBlockNumber: bigint
    /** Vault assets deposited after any swap. */
    vaultAssets: bigint
    /** Encrypted return deposit hash. */
    zoneDepositHash: Hex.Hex
  }
  export type ErrorType =
    | getLogs.ErrorType
    | ObserveErrorType
    | PollErrorType
    | WaitForPrivateDepositTimeoutError
    | Errors.GlobalErrorType
}

/**
 * Gets the vault's active fee configuration, pending fees, and fee baselines.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * })
 *
 * const feeState = await Actions.earn.getFeeState(client, {
 *   vault: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The active fee configuration, pending fees, and baselines.
 */
export async function getFeeState<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getFeeState.Options,
): Promise<getFeeState.ReturnType> {
  const { recipient, vault, ...rest } = options
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
      await read(client, {
        ...rest,
        abi: Abis.vaultAdapter,
        address: vault,
        functionName: 'feeConfig',
        args: [configId],
      }),
    )
  if (recipient !== undefined) {
    const { results } = await multicall(client, {
      ...pickMulticallParameters(rest),
      allowFailure: false,
      calls: [
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
    const [configId, feesActive, highWaterMark, preview, targetBase, shares] =
      results
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
  const { results } = await multicall(client, {
    ...pickMulticallParameters(rest),
    allowFailure: false,
    calls: contracts,
    deployless: true,
  })
  const [configId, feesActive, highWaterMark, preview, targetBase] = results
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
    recipient?: Address.Address | undefined
    /** Vault address. */
    vault: Address.Address
  }
  export type Options = MulticallReadParameters & Args
  export type ReturnType = {
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
  export type ErrorType = Errors.GlobalErrorType
}

/** Vault fee configuration. */
export type FeeConfig = {
  /** Optional excess-return fee over a growing target line. */
  excess: {
    /** Excess fee recipient. */
    account: Address.Address
    /** Annual target growth rate, scaled to 18 decimals. */
    annualTargetRate: bigint
    /** Whether the excess fee is active. */
    enabled: boolean
    /** Rate applied above the target, scaled to 18 decimals. */
    excessFeeRate: bigint
  }
  /** Fixed fee recipients and their 18-decimal rates. */
  fixedFees: readonly { account: Address.Address; rate: bigint }[]
}

/** Pending vault fee amounts. */
export type FeePreview = {
  /** Assets backing active vault shares. */
  activeAssets: bigint
  /** Fee allocations in assets and vault shares. */
  allocations: readonly {
    account: Address.Address
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
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * })
 *
 * const position = await Actions.earn.getPosition(client, {
 *   account: '0x…',
 *   vault: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The asset and vault share balances, allowances, and value.
 */
export async function getPosition<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getPosition.Options<account>,
): Promise<getPosition.ReturnType> {
  const { account: account_ = client.account, vault, ...rest } = options
  if (!account_) throw new Account.NotFoundError()
  const account = Account.from(account_).address
  const { results: tokens } = await multicall(client, {
    ...pickMulticallParameters(rest),
    allowFailure: false,
    calls: [
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
  const [assetToken, shareToken] = tokens
  const { results: balances } = await multicall(client, {
    ...pickMulticallParameters(rest),
    allowFailure: false,
    calls: [
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
  const [assetAllowance, assetBalance, shareAllowance, shareBalance] = balances
  const value = await read(client, {
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
  export type Args<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = AccountParameter<account> & {
    /** Vault address. */
    vault: Address.Address
  }
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = MulticallReadParameters & Args<account>
  export type ReturnType = {
    /** Assets the vault may spend from the account. */
    assetAllowance: bigint
    /** Asset balance held by the account. */
    assetBalance: bigint
    /** Token accepted by the vault. */
    assetToken: Address.Address
    /** Vault shares the vault may spend from the account. */
    shareAllowance: bigint
    /** Vault share balance held by the account. */
    shareBalance: bigint
    /** Token representing vault shares. */
    shareToken: Address.Address
    /** Current asset value of the vault share balance, including fees. */
    value: bigint
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}

/**
 * Gets the asset output for an exact vault share input, including fees.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * })
 *
 * const assetAmount = await Actions.earn.getRedeemQuote(client, {
 *   shareAmount: 100_000_000n,
 *   vault: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The asset output, including fees.
 */
export async function getRedeemQuote<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getRedeemQuote.Options,
): Promise<getRedeemQuote.ReturnType> {
  const { shareAmount, vault, ...rest } = options
  return read(client, {
    ...rest,
    ...getRedeemQuote.call({ shareAmount, vault }),
  })
}

export namespace getRedeemQuote {
  export type Args = {
    /** Exact vault share input, base units. */
    shareAmount: bigint
    /** Vault address. */
    vault: Address.Address
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  /** Asset output, including fees. */
  export type ReturnType = read.ReturnType<
    typeof Abis.vaultAdapter,
    'previewRedeem',
    never
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the vault's `previewRedeem` function.
   *
   * Can be passed as a parameter to:
   * - [`Actions.contract.estimateGas`](https://viem.sh/docs/actions/public/contract/estimateGas): estimate the gas cost of the call
   * - [`multicall`](https://viem.sh/docs/contract/multicall): batch the call with other contract reads
   * - [`Actions.contract.simulate`](https://viem.sh/docs/actions/public/contract/simulate): simulate the call
   *
   * @example
   * ```ts
   * import { Actions } from 'viem/tempo'
   *
   * const call = Actions.earn.getRedeemQuote.call({
   *   shareAmount: 100_000_000n,
   *   vault: '0x…',
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { shareAmount, vault } = args
    return defineCall({
      address: vault,
      abi: Abis.vaultAdapter,
      args: [shareAmount],
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
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * })
 *
 * const vault = await Actions.earn.getVault(client, {
 *   vault: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The vault state and metadata.
 */
export async function getVault<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getVault.Options,
): Promise<getVault.ReturnType> {
  const { vault, ...rest } = options
  const engine = await read(client, {
    ...rest,
    abi: Abis.vaultAdapter,
    address: vault,
    functionName: 'engine',
  })
  const { results } = await multicall(client, {
    ...pickMulticallParameters(rest),
    allowFailure: false,
    calls: getVault.calls({ engine, vault }),
    deployless: true,
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
  ] = results
  if (!Address.isEqual(engine, engine_))
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
    vault: Address.Address
  }
  export type Options = MulticallReadParameters & Args
  export type ReturnType = {
    /** Token accepted by the vault. */
    assetToken: Address.Address
    /** Address allowed to cancel queued redemptions; zero when disabled. */
    asyncJanitor: Address.Address
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
    emergencyGuardian: Address.Address
    /** Current venue integration. */
    engine: {
      /** Integration address. */
      address: Address.Address
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
    operator: Address.Address
    /** Open queued redemptions. */
    pendingRedeemCount: bigint
    /** Active vault share supply. */
    shareSupply: bigint
    /** Token representing vault shares. */
    shareToken: Address.Address
  }
  // TODO: exhaustive error type
  export type ErrorType = GetVaultEngineChangedError | Errors.GlobalErrorType

  /**
   * Defines the reads used by {@link getVault}. Pass the vault's current
   * engine address.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(args: Args & { engine: Address.Address }) {
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
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * })
 *
 * const shareAmount = await Actions.earn.getWithdrawQuote(client, {
 *   assetAmount: 250_000_000n,
 *   vault: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The required vault share input, ceiling-rounded.
 */
export async function getWithdrawQuote<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getWithdrawQuote.Options,
): Promise<getWithdrawQuote.ReturnType> {
  const { assetAmount, vault, ...rest } = options
  return read(client, {
    ...rest,
    ...getWithdrawQuote.call({ assetAmount, vault }),
  })
}

export namespace getWithdrawQuote {
  export type Args = {
    /** Exact asset output, base units. */
    assetAmount: bigint
    /** Vault address. */
    vault: Address.Address
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  /** Required vault share input, ceiling-rounded. */
  export type ReturnType = read.ReturnType<
    typeof Abis.vaultAdapter,
    'previewWithdraw',
    never
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /**
   * Defines a call to the vault's `previewWithdraw` function.
   *
   * Can be passed as a parameter to:
   * - [`Actions.contract.estimateGas`](https://viem.sh/docs/actions/public/contract/estimateGas): estimate the gas cost of the call
   * - [`multicall`](https://viem.sh/docs/contract/multicall): batch the call with other contract reads
   * - [`Actions.contract.simulate`](https://viem.sh/docs/actions/public/contract/simulate): simulate the call
   *
   * @example
   * ```ts
   * import { Actions } from 'viem/tempo'
   *
   * const call = Actions.earn.getWithdrawQuote.call({
   *   assetAmount: 250_000_000n,
   *   vault: '0x…',
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
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.earn.redeem(client, {
 *   shareAmount: 100_000_000n,
 *   slippageBps: 50,
 *   vault: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function redeem<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: redeem.Options,
): Promise<redeem.ReturnType> {
  return redeem.inner(send, client, options)
}

export namespace redeem {
  export type Args = {
    /** Vault shares to redeem; base units or `{ formatted, decimals? }`. */
    shareAmount: internal_Token.AmountInput
    /** Asset recipient. @default `account.address` */
    recipient?: Address.Address | undefined
    /** Vault address. */
    vault: Address.Address
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
  export type Options = WriteParameters & Args
  export type ReturnType = send.ReturnType
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal Shared dispatch; reads the vault share token for the approval. */
  export async function inner<
    action extends typeof send | typeof sendSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    options: redeem.Options,
  ): Promise<dispatchSend.ReturnType<action>> {
    const [args, shareToken] = await Promise.all([
      toRedeemArgs(client, options),
      read(client, {
        abi: Abis.vaultAdapter,
        address: options.vault,
        functionName: 'shareToken',
      }),
    ])
    return dispatchSend(action, client, {
      ...pickWriteParameters(options),
      ...(action === sendSync ? pickWriteSyncParameters(options) : {}),
      calls: redeem.calls({ ...args, shareToken }),
    })
  }

  /**
   * Defines a redeem call without an approval. Provide vault share decimals
   * for formatted inputs and an explicit output bound because this builder performs no reads.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<call.Args, Client.Client<chain>>
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
      recipient: Address.Address
      /** Vault address. */
      vault: Address.Address
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
      shareToken: Address.Address
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
    ] as const
  }

  /**
   * Extracts a `Redeemed` event from the vault's logs.
   *
   * @param logs - Logs.
   * @param options - Options.
   * @returns The `Redeemed` event.
   */
  export function extractEvent(
    logs: readonly Log.Log[],
    options: { vault: Address.Address },
  ) {
    const { vault } = options
    // Earn contracts are user-deployed: several adapters can emit the same
    // signature in one receipt, so filter by emitting address before decode.
    const [log] = AbiEvent.extractLogs(
      Abis.vaultAdapter,
      logs.filter((log) => Address.isEqual(log.address, vault)),
      { eventName: 'Redeemed', strict: true },
    )
    if (!log) throw new Error('`Redeemed` event not found.')
    return log
  }

  /**
   * Estimates gas for a redemption, assuming enough vault share allowance.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: redeem.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...redeem.call(await toRedeemArgs(client, options)),
    })
  }

  /**
   * Simulates a redemption, assuming enough vault share allowance.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: redeem.Options,
  ): Promise<simulateContract.ReturnType<typeof Abis.vaultAdapter, 'redeem'>> {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...redeem.call(await toRedeemArgs(client, options)),
    })
  }
}

/**
 * Redeems vault shares and returns the confirmed receipt and event data.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const { assetAmount } = await Actions.earn.redeemSync(client, {
 *   assetAmountMin: 99_500_000n,
 *   shareAmount: 100_000_000n,
 *   vault: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function redeemSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: redeemSync.Options,
): Promise<redeemSync.ReturnType> {
  const { throwOnReceiptRevert = true, vault } = options
  const receipt = await redeem.inner(sendSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
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
  export type Options = redeem.Options & WriteSyncParameters
  export type ReturnType = Compute<{
    /** Assets paid out. */
    assetAmount: bigint
    /** Redeeming caller. */
    caller: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
    /** Asset recipient. */
    recipient: Address.Address
    /** Vault shares burned. */
    shareAmount: bigint
  }>
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}

/**
 * Withdraws vault shares from a Zone and redeems them on the parent chain. Use
 * {@link privateRedeem.prepare} to build the encrypted callback.
 *
 * @example
 * ```ts
 * const prepared = await Actions.earn.privateRedeem.prepare(parentClient, {
 *   gateway: '0x…',
 *   recipient: '0x…',
 *   recoveryRecipient: '0x…',
 *   shareAmount: 100_000_000n,
 *   slippageBps: 50,
 * })
 * const hash = await Actions.earn.privateRedeem(zoneClient, prepared)
 * ```
 *
 * @param client - Zone client.
 * @param options - Prepared redemption and transaction options.
 * @returns The transaction hash.
 */
export async function privateRedeem<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: privateRedeem.Options<account>,
): Promise<privateRedeem.ReturnType> {
  await assertPreparedZoneRequestChain(client, options)
  return zoneActions.requestWithdrawal(client, options)
}

export namespace privateRedeem {
  export type Args = prepare.ReturnType
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = zoneActions.requestWithdrawal.Options<account> & Args
  export type ReturnType = send.ReturnType
  export type ErrorType = zoneActions.requestWithdrawal.ErrorType

  /**
   * Builds an encrypted Zone withdrawal that redeems vault shares and returns
   * the resulting assets to the Zone.
   *
   * @param client - Parent-chain client.
   * @param options - Redemption intent and recovery options.
   * @returns The prepared withdrawal and correlation data.
   */
  export async function prepare<chain extends Chain.Chain | undefined>(
    client: Client.Client<chain>,
    options: prepare.Options,
  ): Promise<prepare.ReturnType> {
    const chainId = client.chain?.id
    if (!chainId) throw new Error('`chain` is required.')
    const {
      actionId = Hex.random(32),
      callbackGas = zoneGatewayCallbackGas,
      fallbackRecipient = options.recoveryRecipient,
      gateway,
      recipient,
      recoveryRecipient,
      returnMemo,
      shareAmount,
      withdrawalMemo,
    } = options
    const readParameters = pickReadParameters(options)
    const [fromBlock, config] = await Promise.all([
      getNumber(client, { cacheTime: 0 }),
      getZoneGatewayConfig(client, { ...readParameters, gateway }),
    ])
    const assetToken = options.assetToken ?? config.vaultAsset
    if (Address.isEqual(assetToken, config.shareToken))
      throw new Error('`assetToken` cannot be the gateway vault share token.')

    const [{ encrypted, keyIndex }, assetAmountMin] = await Promise.all([
      zoneActions.encryptedDeposit.prepareRecipient(client, {
        ...readParameters,
        memo: returnMemo,
        portalAddress: config.zonePortal,
        recipient,
        zoneId: config.zoneId,
      }),
      (async () => {
        if (options.assetAmountMin !== undefined)
          return EarnShares.minimumOutput(options.assetAmountMin, 0)
        if (options.assetAmount !== undefined)
          return EarnShares.minimumOutput(
            options.assetAmount,
            options.slippageBps,
          )
        const assetAmount = await getRedeemQuote(client, {
          ...readParameters,
          shareAmount,
          vault: config.vaultAdapter,
        })
        return EarnShares.minimumOutput(assetAmount, options.slippageBps)
      })(),
    ])
    const direct = Address.isEqual(assetToken, config.vaultAsset)
    const data = AbiParameters.encode(Abis.zoneGatewayCallbackData, [
      {
        flow: 1,
        outputToken: assetToken,
        keyIndex,
        encrypted,
        minVaultAssets: direct ? assetAmountMin : 1n,
        minVaultShares: 0n,
        minOutputAmount: direct ? 0n : assetAmountMin,
        actionId,
        refundRecipient: recoveryRecipient,
      },
    ])
    return {
      actionId,
      amount: shareAmount,
      callbackGas,
      chainId,
      data,
      fallbackRecipient,
      fromBlock,
      memo: withdrawalMemo,
      to: gateway,
      token: config.shareToken,
      zoneId: config.zoneId,
    }
  }

  export namespace prepare {
    export type Options = MulticallReadParameters &
      PrivatePreparationParameters & {
        /** Vault shares withdrawn from the Zone, base units. */
        shareAmount: bigint
      } & (
        | ({
            /** Asset token returned to the Zone. @default gateway vault asset */
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
            assetToken: Address.Address
          } & MinimumAssetAmountParameters)
      )
    export type ReturnType = PreparedZoneRequest
    export type ErrorType = Errors.GlobalErrorType
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
 * @param options - Prepared redemption and transaction options.
 * @returns The Zone transaction receipt and parent-chain withdrawal sender tag.
 */
export async function privateRedeemSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: privateRedeemSync.Options<account>,
): Promise<privateRedeemSync.ReturnType> {
  await assertPreparedZoneRequestChain(client, options)
  return zoneActions.requestWithdrawalSync(client, options)
}

export namespace privateRedeemSync {
  export type Args = privateRedeem.Args
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = privateRedeem.Options<account> & WriteSyncParameters
  export type ReturnType = zoneActions.requestWithdrawalSync.ReturnType
  export type ErrorType = zoneActions.requestWithdrawalSync.ErrorType
}

/**
 * Waits for a Zone gateway redemption to complete on the parent chain.
 *
 * @example
 * ```ts
 * const result = await Actions.earn.waitForPrivateRedeem(parentClient, {
 *   actionId: prepared.actionId,
 *   fromBlock: prepared.fromBlock,
 *   gateway: '0x…',
 * })
 * ```
 *
 * @param client - Parent-chain client.
 * @param options - Prepared action correlation and polling options.
 * @returns The completed gateway redemption.
 */
export async function waitForPrivateRedeem<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: waitForPrivateRedeem.Options,
): Promise<waitForPrivateRedeem.ReturnType> {
  const {
    actionId,
    fromBlock,
    gateway,
    pollingInterval = client.pollingInterval,
    timeout = 60_000,
  } = options
  const event = AbiEvent.fromAbi(Abis.zoneGateway, 'EarnRedeem')
  const observerId = stringify([
    'waitForPrivateRedeem',
    client.uid,
    gateway,
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
              address: gateway,
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
              shares: log.args.shares,
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
        reject_(new WaitForPrivateRedeemTimeoutError({ actionId, gateway }))
      }, timeout)
    : undefined

  return await promise
}

export namespace waitForPrivateRedeem {
  export type Options = {
    /** Correlation id from {@link privateRedeem.prepare}. */
    actionId: Hex.Hex
    /** Lower bound for the parent-chain log scan. */
    fromBlock: bigint
    /** Zone gateway address. */
    gateway: Address.Address
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
    outputToken: Address.Address
    /** Vault shares redeemed. */
    shares: bigint
    /** Parent-chain block containing the gateway event. */
    tempoBlockNumber: bigint
    /** Vault assets produced before any swap. */
    vaultAssets: bigint
    /** Encrypted return deposit hash. */
    zoneDepositHash: Hex.Hex
  }
  export type ErrorType =
    | getLogs.ErrorType
    | ObserveErrorType
    | PollErrorType
    | WaitForPrivateRedeemTimeoutError
    | Errors.GlobalErrorType
}

/**
 * Withdraws an exact asset amount to `recipient`, up to the specified vault
 * share limit. The transaction includes the required vault share approval;
 * use {@link redeem} for a full exit.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.earn.withdrawExact(client, {
 *   assetAmount: 40_000_000n,
 *   slippageBps: 50,
 *   vault: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function withdrawExact<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: withdrawExact.Options,
): Promise<withdrawExact.ReturnType> {
  return withdrawExact.inner(send, client, options)
}

export namespace withdrawExact {
  export type Args = {
    /** Exact assets to receive; base units or `{ formatted, decimals? }`. */
    assetAmount: internal_Token.AmountInput
    /** Asset recipient. @default `account.address` */
    recipient?: Address.Address | undefined
    /** Vault address. */
    vault: Address.Address
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
  export type Options = WriteParameters & Args
  export type ReturnType = send.ReturnType
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal Shared dispatch; reads the vault share token for the approval. */
  export async function inner<
    action extends typeof send | typeof sendSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    options: withdrawExact.Options,
  ): Promise<dispatchSend.ReturnType<action>> {
    const [args, shareToken] = await Promise.all([
      toWithdrawExactArgs(client, options),
      read(client, {
        abi: Abis.vaultAdapter,
        address: options.vault,
        functionName: 'shareToken',
      }),
    ])
    return dispatchSend(action, client, {
      ...pickWriteParameters(options),
      ...(action === sendSync ? pickWriteSyncParameters(options) : {}),
      calls: withdrawExact.calls({ ...args, shareToken }),
    })
  }

  /**
   * Defines an exact withdrawal call without an approval. Provide asset
   * decimals and an explicit input limit because this builder performs no reads.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<call.Args, Client.Client<chain>>
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
      recipient: Address.Address
      /** Vault address. */
      vault: Address.Address
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
      shareToken: Address.Address
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
    ] as const
  }

  /**
   * Extracts a `WithdrewExact` event from the vault's logs.
   *
   * @param logs - Logs.
   * @param options - Options.
   * @returns The `WithdrewExact` event.
   */
  export function extractEvent(
    logs: readonly Log.Log[],
    options: { vault: Address.Address },
  ) {
    const { vault } = options
    // Earn contracts are user-deployed: several adapters can emit the same
    // signature in one receipt, so filter by emitting address before decode.
    const [log] = AbiEvent.extractLogs(
      Abis.vaultAdapter,
      logs.filter((log) => Address.isEqual(log.address, vault)),
      { eventName: 'WithdrewExact', strict: true },
    )
    if (!log) throw new Error('`WithdrewExact` event not found.')
    return log
  }

  /**
   * Estimates gas for an exact withdrawal, assuming enough vault share allowance.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: withdrawExact.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...withdrawExact.call(await toWithdrawExactArgs(client, options)),
    })
  }

  /**
   * Simulates an exact withdrawal, assuming enough vault share allowance.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: withdrawExact.Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.vaultAdapter, 'withdrawExact'>
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...withdrawExact.call(await toWithdrawExactArgs(client, options)),
    })
  }
}

/**
 * Withdraws an exact asset amount and returns the confirmed receipt and event data.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const { shareAmount } = await Actions.earn.withdrawExactSync(client, {
 *   assetAmount: 40_000_000n,
 *   shareAmountMax: 40_200_000n,
 *   vault: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt and event data.
 */
export async function withdrawExactSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: withdrawExactSync.Options,
): Promise<withdrawExactSync.ReturnType> {
  const { throwOnReceiptRevert = true, vault } = options
  const receipt = await withdrawExact.inner(sendSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
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
  export type Options = withdrawExact.Options & WriteSyncParameters
  export type ReturnType = Compute<{
    /** Exact assets received. */
    assetAmount: bigint
    /** Withdrawing caller. */
    caller: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
    /** Asset recipient. */
    recipient: Address.Address
    /** Vault shares burned. */
    shareAmount: bigint
  }>
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
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

type MinimumShareAmountParameters = OneOf<
  | {
      /** Minimum vault shares returned to the Zone. */
      shareAmountMin: bigint
    }
  | {
      /** Quoted vault shares returned to the Zone. */
      shareAmount: bigint
      /** Slippage tolerance under `shareAmount` (50 = 0.5%). */
      slippageBps: number
    }
>

type PrivatePreparationParameters = {
  /** Optional caller-supplied correlation id. @default Random bytes32 */
  actionId?: Hex.Hex | undefined
  /** Gas reserved for the parent-chain callback. @default `10_000_000n` */
  callbackGas?: bigint | undefined
  /** Public recipient if the parent-chain callback fails. @default `recoveryRecipient` */
  fallbackRecipient?: Address.Address | undefined
  /** Gateway identifying the vault and Zone configuration. */
  gateway: Address.Address
  /** Encrypted recipient for the returned tokens. */
  recipient: Address.Address
  /** Public recipient if the encrypted return fails. */
  recoveryRecipient: Address.Address
  /** Optional memo encrypted with the returned Zone deposit. */
  returnMemo?: Hex.Hex | undefined
  /** Optional memo attached to the Zone withdrawal. */
  withdrawalMemo?: Hex.Hex | undefined
}

type PreparedZoneRequest = {
  /** Correlation id for the matching wait action. */
  actionId: Hex.Hex
  /** Withdrawal amount, passed through to the Zone action. */
  amount: bigint
  /** Gas reserved for the parent-chain callback. */
  callbackGas: bigint
  /** Parent chain containing the gateway. */
  chainId: number
  /** Encoded gateway callback. */
  data: Hex.Hex
  /** Public recipient if the parent-chain callback fails. */
  fallbackRecipient: Address.Address
  /** Parent-chain block before the withdrawal is submitted. */
  fromBlock: bigint
  /** Optional memo attached to the Zone withdrawal. */
  memo?: Hex.Hex | undefined
  /** Zone gateway receiving the withdrawal. */
  to: Address.Address
  /** Token withdrawn from the Zone. */
  token: Address.Address
  /** Zone containing the withdrawn tokens. */
  zoneId: number
}

const zoneGatewayCallbackGas = 10_000_000n

function resolveMinimumShareAmount(options: MinimumShareAmountParameters) {
  if (options.shareAmountMin !== undefined)
    return EarnShares.minimumOutput(options.shareAmountMin, 0)
  return EarnShares.minimumOutput(options.shareAmount, options.slippageBps)
}

async function assertPreparedZoneRequestChain(
  client: Client.Client<Chain.Chain | undefined>,
  options: PreparedZoneRequest,
) {
  const chain = client.chain
  if (!chain) throw new Error('`chain` is required.')
  if (chain.sourceId !== options.chainId)
    throw new Error(
      'Prepared Zone request parent chain ID does not match client chain.',
    )
  const { zoneId } = await zoneActions.getZoneInfo(client)
  if (zoneId !== options.zoneId)
    throw new Error(
      'Prepared Zone request Zone ID does not match client chain.',
    )
}

type MulticallReadParameters = Omit<
  ReadParameters,
  'account' | 'blockOverrides'
>

function pickReadParameters(options: MulticallReadParameters) {
  const { stateOverride } = options
  if (options.blockNumber !== undefined)
    return {
      blockNumber: options.blockNumber,
      stateOverride,
    }
  return { blockTag: options.blockTag, stateOverride }
}

function pickMulticallParameters(options: MulticallReadParameters) {
  const { stateOverride } = options
  if (options.blockNumber !== undefined)
    return { blockNumber: options.blockNumber, stateOverride }
  return { blockTag: options.blockTag, stateOverride }
}

async function getZoneGatewayConfig<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: MulticallReadParameters & { gateway: Address.Address },
) {
  const { gateway, ...rest } = options
  const { results } = await multicall(client, {
    ...pickMulticallParameters(rest),
    allowFailure: false,
    calls: [
      defineCall({
        abi: Abis.zoneGateway,
        address: gateway,
        functionName: 'vaultAdapter',
      }),
      defineCall({
        abi: Abis.zoneGateway,
        address: gateway,
        functionName: 'vaultAsset',
      }),
      defineCall({
        abi: Abis.zoneGateway,
        address: gateway,
        functionName: 'shareToken',
      }),
      defineCall({
        abi: Abis.zoneGateway,
        address: gateway,
        functionName: 'zoneId',
      }),
      defineCall({
        abi: Abis.zoneGateway,
        address: gateway,
        functionName: 'zonePortal',
      }),
      defineCall({
        abi: Abis.zoneGateway,
        address: gateway,
        args: [2],
        functionName: 'supportsFlow',
      }),
    ],
    deployless: true,
  })
  const [
    vaultAdapter,
    vaultAsset,
    shareToken,
    zoneId,
    zonePortal,
    supportsAsyncFlow,
  ] = results
  if (supportsAsyncFlow)
    throw new Error('Async Zone gateways are not supported.')
  return { shareToken, vaultAdapter, vaultAsset, zoneId, zonePortal }
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
  config: read.ReturnType<typeof Abis.vaultAdapter, 'feeConfig'>,
): FeeConfig {
  return {
    excess: config.excess,
    fixedFees: config.fixedFees.slice(0, config.fixedFeeCount),
  }
}

/** Trims the decoded `IVaultFees.FeePreview` to its active allocation count. */
function toFeePreview(
  preview: read.ReturnType<typeof Abis.vaultAdapter, 'previewAccruedFees'>,
): FeePreview {
  const { allocationCount, allocations, ...rest } = preview
  return { ...rest, allocations: allocations.slice(0, allocationCount) }
}

/** Resolves `deposit` options into the adapter call args. @internal */
async function toDepositArgs(
  client: Client.Client<Chain.Chain | undefined, Account.Account | undefined>,
  options: deposit.Options,
): Promise<deposit.call.Args> {
  const { vault } = options
  const assetAmount = await toBaseUnitsLive(client, {
    amount: options.assetAmount,
    token: 'asset',
    vault,
  })
  const args = {
    assetAmount,
    recipient: resolveRecipient(client, options),
    vault,
  }
  if (options.shareAmountMin !== undefined)
    return { ...args, shareAmountMin: options.shareAmountMin }
  return {
    ...args,
    shareAmount: options.shareAmount,
    slippageBps: options.slippageBps,
  }
}

/** Resolves `depositShares` options into the adapter call args. @internal */
function toDepositSharesArgs(
  client: Client.Client<Chain.Chain | undefined, Account.Account | undefined>,
  options: depositShares.Options,
): depositShares.call.Args {
  const { vault, venueShareAmount } = options
  const args = {
    recipient: resolveRecipient(client, options),
    vault,
    venueShareAmount,
  }
  if (options.earnShareAmountMin !== undefined)
    return { ...args, earnShareAmountMin: options.earnShareAmountMin }
  return {
    ...args,
    earnShareAmount: options.earnShareAmount,
    slippageBps: options.slippageBps,
  }
}

/** Resolves `redeem` options into the adapter call args. @internal */
async function toRedeemArgs(
  client: Client.Client<Chain.Chain | undefined, Account.Account | undefined>,
  options: redeem.Options,
): Promise<redeem.call.Args> {
  const { vault } = options
  const shareAmount = await toBaseUnitsLive(client, {
    amount: options.shareAmount,
    token: 'shareToken',
    vault,
  })
  const args = {
    recipient: resolveRecipient(client, options),
    shareAmount,
    vault,
  }
  if (options.assetAmountMin !== undefined)
    return { ...args, assetAmountMin: options.assetAmountMin }
  const assetAmount = await (async () => {
    if (options.assetAmount !== undefined) return options.assetAmount
    return getRedeemQuote(client, { shareAmount, vault })
  })()
  return {
    ...args,
    assetAmount,
    slippageBps: options.slippageBps,
  }
}

/** Resolves `withdrawExact` options into the adapter call args. @internal */
async function toWithdrawExactArgs(
  client: Client.Client<Chain.Chain | undefined, Account.Account | undefined>,
  options: withdrawExact.Options,
): Promise<withdrawExact.call.Args> {
  const { vault } = options
  const assetAmount = await toBaseUnitsLive(client, {
    amount: options.assetAmount,
    token: 'asset',
    vault,
  })
  const args = {
    assetAmount,
    recipient: resolveRecipient(client, options),
    vault,
  }
  if (options.shareAmountMax !== undefined)
    return { ...args, shareAmountMax: options.shareAmountMax }
  const shareAmount = await (async () => {
    if (options.shareAmount !== undefined) return options.shareAmount
    return getWithdrawQuote(client, { assetAmount, vault })
  })()
  return {
    ...args,
    shareAmount,
    slippageBps: options.slippageBps,
  }
}

/** Raises a quoted input by basis points with ceiling rounding. @internal */
function maximumInput(shareAmount: bigint, slippageBps: number): bigint {
  if (shareAmount <= 0n)
    throw new EarnShares.InvalidExpectedOutputError({
      expectedAmount: shareAmount,
    })
  if (
    !Number.isInteger(slippageBps) ||
    slippageBps < 0 ||
    slippageBps >= EarnShares.basisPointScale
  )
    throw new EarnShares.InvalidSlippageError({ slippageBps })
  const scale = BigInt(EarnShares.basisPointScale)
  const numerator = shareAmount * (scale + BigInt(slippageBps))
  // Adding the denominator minus one converts floor division to ceiling.
  return (numerator + scale - 1n) / scale
}

/**
 * Converts an amount to base units, resolving missing decimals with live
 * reads of the vault's asset or share token. Vault share tokens are not
 * genesis-declared, so nothing is cached. @internal
 */
async function toBaseUnitsLive(
  client: Client.Client<Chain.Chain | undefined>,
  options: {
    amount: internal_Token.AmountInput
    token: 'asset' | 'shareToken'
    vault: Address.Address
  },
): Promise<bigint> {
  const { amount, token, vault } = options
  if (typeof amount === 'bigint') return amount
  if (amount.decimals !== undefined)
    return internal_Token.toBaseUnits(amount, amount.decimals)
  const address = await read(client, {
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
  client: Client.Client<Chain.Chain | undefined, Account.Account | undefined>,
  options: {
    account?: Account.Account | Address.Address | undefined
    recipient?: Address.Address | undefined
  },
): Address.Address {
  if (options.recipient) return options.recipient
  const account = options.account ?? client.account
  if (!account) throw new Account.NotFoundError()
  return Account.from(account).address
}

type AccountParameter<
  account extends Account.Account | undefined = Account.Account | undefined,
> = account extends Account.Account
  ? { account?: Account.Account | Address.Address | undefined }
  : { account: Account.Account | Address.Address }
