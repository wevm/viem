import type { Address } from 'ox'
import type { TokenRole } from 'ox/tempo'

import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import { TempoExecutionError } from '../../errors.js'
import { formatAmount, type Resolvers } from '../../internal/errors.js'
import { isTip20 } from '../../internal/utils.js'

const zeroAddress = '0x0000000000000000000000000000000000000000'

/** Errors this module throws for decoded Tempo errors. Narrow with `error.name`. */
export type ExecutionErrorType =
  | TokenInsufficientAllowanceErrorType
  | TokenInsufficientBalanceErrorType
  | TokenPausedErrorType
  | TokenPolicyForbidsErrorType
  | TokenSupplyCapExceededErrorType
  | TokenUnauthorizedErrorType

/** `TokenInsufficientBalanceError` with a literal `name`, for narrowing. */
export type TokenInsufficientBalanceErrorType =
  TokenInsufficientBalanceError & { name: 'TokenInsufficientBalanceError' }

/** Thrown when an account's TIP-20 balance is lower than the amount a call needs. */
export class TokenInsufficientBalanceError extends TempoExecutionError<
  TempoExecutionError.Decoded<'InsufficientBalance'>
> {
  /** Balance available. */
  available: bigint
  /** Token decimals, when known. */
  decimals: number | undefined
  /** Amount required. */
  required: bigint
  /** Token address. */
  token: Address.Address

  constructor(
    parameters: TempoExecutionError.Parameters & {
      decimals?: number | undefined
    },
  ) {
    const { decimals } = parameters
    const [available, required, token] = parameters.error.args as readonly [
      bigint,
      bigint,
      Address.Address,
    ]
    super(parameters, {
      details: {
        token,
        available: formatAmount(available, decimals),
        required: formatAmount(required, decimals),
        shortfall: formatAmount(required - available, decimals),
      },
      name: 'TokenInsufficientBalanceError',
      shortMessage: `Insufficient balance of token "${token}".`,
    })
    this.available = available
    this.decimals = decimals
    this.required = required
    this.token = token
  }
}

/** `TokenInsufficientAllowanceError` with a literal `name`, for narrowing. */
export type TokenInsufficientAllowanceErrorType =
  TokenInsufficientAllowanceError & { name: 'TokenInsufficientAllowanceError' }

/** Thrown when a spender's TIP-20 allowance is lower than the amount it tries to transfer. */
export class TokenInsufficientAllowanceError extends TempoExecutionError<
  TempoExecutionError.Decoded<'InsufficientAllowance'>
> {
  /** Current allowance, when known. */
  allowance: bigint | undefined
  /** Amount the spender tried to transfer. */
  amount: bigint | undefined
  /** Token decimals, when known. */
  decimals: number | undefined
  /** Token owner. */
  owner: Address.Address
  /** Spender. */
  spender: Address.Address
  /** Token address. */
  token: Address.Address

  constructor(parameters: TokenInsufficientAllowanceError.Parameters) {
    const { allowance, amount, decimals, owner, spender, token } = parameters
    super(parameters, {
      details: {
        token,
        owner,
        spender,
        allowance: formatAmount(allowance, decimals),
        amount: formatAmount(amount, decimals),
      },
      name: 'TokenInsufficientAllowanceError',
      shortMessage: `Spender "${spender}" has an insufficient allowance from "${owner}" for token "${token}".`,
    })
    this.allowance = allowance
    this.amount = amount
    this.decimals = decimals
    this.owner = owner
    this.spender = spender
    this.token = token
  }
}

export declare namespace TokenInsufficientAllowanceError {
  /** Constructor parameters. */
  type Parameters = TempoExecutionError.Parameters & {
    /** Current allowance, when known. */
    allowance?: bigint | undefined
    /** Amount the spender tried to transfer. */
    amount?: bigint | undefined
    /** Token decimals, when known. */
    decimals?: number | undefined
    /** Token owner. */
    owner: Address.Address
    /** Spender. */
    spender: Address.Address
    /** Token address. */
    token: Address.Address
  }
}

/** `TokenSupplyCapExceededError` with a literal `name`, for narrowing. */
export type TokenSupplyCapExceededErrorType = TokenSupplyCapExceededError & {
  name: 'TokenSupplyCapExceededError'
}

/** Thrown when minting would exceed a TIP-20 token's supply cap. */
export class TokenSupplyCapExceededError extends TempoExecutionError<
  TempoExecutionError.Decoded<'SupplyCapExceeded'>
> {
  /** Amount to mint. */
  amount: bigint | undefined
  /** Token decimals, when known. */
  decimals: number | undefined
  /** Supply cap, when known. */
  supplyCap: bigint | undefined
  /** Token address. */
  token: Address.Address
  /** Current total supply, when known. */
  totalSupply: bigint | undefined

  constructor(parameters: TokenSupplyCapExceededError.Parameters) {
    const { amount, decimals, supplyCap, token, totalSupply } = parameters
    super(parameters, {
      details: {
        token,
        amount: formatAmount(amount, decimals),
        'total supply': formatAmount(totalSupply, decimals),
        'supply cap': formatAmount(supplyCap, decimals),
        'mintable amount':
          supplyCap !== undefined && totalSupply !== undefined
            ? formatAmount(supplyCap - totalSupply, decimals)
            : undefined,
      },
      name: 'TokenSupplyCapExceededError',
      shortMessage: `Minting exceeds the supply cap of token "${token}".`,
    })
    this.amount = amount
    this.decimals = decimals
    this.supplyCap = supplyCap
    this.token = token
    this.totalSupply = totalSupply
  }
}

export declare namespace TokenSupplyCapExceededError {
  /** Constructor parameters. */
  type Parameters = TempoExecutionError.Parameters & {
    /** Amount to mint. */
    amount?: bigint | undefined
    /** Token decimals, when known. */
    decimals?: number | undefined
    /** Supply cap, when known. */
    supplyCap?: bigint | undefined
    /** Token address. */
    token: Address.Address
    /** Current total supply, when known. */
    totalSupply?: bigint | undefined
  }
}

/** `TokenPolicyForbidsError` with a literal `name`, for narrowing. */
export type TokenPolicyForbidsErrorType = TokenPolicyForbidsError & {
  name: 'TokenPolicyForbidsError'
}

/** Thrown when a TIP-20 token's transfer policy forbids the sender or recipient. */
export class TokenPolicyForbidsError extends TempoExecutionError<
  TempoExecutionError.Decoded<'PolicyForbids'>
> {
  /** Sender, when known. */
  from: Address.Address | undefined
  /** Transfer policy ID, when known. */
  policyId: bigint | undefined
  /** Whether the policy authorizes the recipient, when known. */
  recipientAuthorized: boolean | undefined
  /** Whether the policy authorizes the sender, when known. */
  senderAuthorized: boolean | undefined
  /** Recipient, when known. */
  to: Address.Address | undefined
  /** Token address. */
  token: Address.Address

  constructor(parameters: TokenPolicyForbidsError.Parameters) {
    const { from, policyId, recipientAuthorized, senderAuthorized, to, token } =
      parameters
    const party =
      senderAuthorized === false
        ? `sender "${from}"`
        : recipientAuthorized === false
          ? `recipient "${to}"`
          : 'this transfer'
    super(parameters, {
      details: {
        token,
        policy: policyId,
        from,
        to,
        'sender authorized': senderAuthorized?.toString(),
        'recipient authorized': recipientAuthorized?.toString(),
      },
      name: 'TokenPolicyForbidsError',
      shortMessage: `The transfer policy of token "${token}" forbids ${party}.`,
    })
    this.from = from
    this.policyId = policyId
    this.recipientAuthorized = recipientAuthorized
    this.senderAuthorized = senderAuthorized
    this.to = to
    this.token = token
  }
}

export declare namespace TokenPolicyForbidsError {
  /** Constructor parameters. */
  type Parameters = TempoExecutionError.Parameters & {
    /** Sender, when known. */
    from?: Address.Address | undefined
    /** Transfer policy ID, when known. */
    policyId?: bigint | undefined
    /** Whether the policy authorizes the recipient, when known. */
    recipientAuthorized?: boolean | undefined
    /** Whether the policy authorizes the sender, when known. */
    senderAuthorized?: boolean | undefined
    /** Recipient, when known. */
    to?: Address.Address | undefined
    /** Token address. */
    token: Address.Address
  }
}

/** `TokenPausedError` with a literal `name`, for narrowing. */
export type TokenPausedErrorType = TokenPausedError & {
  name: 'TokenPausedError'
}

/** Thrown when calling a paused TIP-20 token. */
export class TokenPausedError extends TempoExecutionError<
  TempoExecutionError.Decoded<'ContractPaused'>
> {
  /** Token address. */
  token: Address.Address

  constructor(
    parameters: TempoExecutionError.Parameters & { token: Address.Address },
  ) {
    super(parameters, {
      name: 'TokenPausedError',
      shortMessage: `Token "${parameters.token}" is paused.`,
    })
    this.token = parameters.token
  }
}

/** `TokenUnauthorizedError` with a literal `name`, for narrowing. */
export type TokenUnauthorizedErrorType = TokenUnauthorizedError & {
  name: 'TokenUnauthorizedError'
}

/** Thrown when an account lacks the TIP-20 role a call requires. */
export class TokenUnauthorizedError extends TempoExecutionError<
  TempoExecutionError.Decoded<'Unauthorized'>
> {
  /** Account that made the call. */
  account: Address.Address
  /** Role the call requires. */
  role: TokenRole.TokenRole
  /** Token address. */
  token: Address.Address

  constructor(
    parameters: TempoExecutionError.Parameters & {
      account: Address.Address
      role: TokenRole.TokenRole
      token: Address.Address
    },
  ) {
    const { account, role, token } = parameters
    super(parameters, {
      details: { token, account, role },
      name: 'TokenUnauthorizedError',
      shortMessage: `Account "${account}" does not have the "${role}" role on token "${token}".`,
    })
    this.account = account
    this.role = role
    this.token = token
  }
}

/** Roles required by TIP-20 functions. */
const requiredRoles: Record<string, TokenRole.TokenRole> = {
  burn: 'issuer',
  burnAt: 'burnAt',
  burnBlocked: 'burnBlocked',
  burnWithMemo: 'issuer',
  changeTransferPolicyId: 'defaultAdmin',
  completeQuoteTokenUpdate: 'defaultAdmin',
  mint: 'issuer',
  mintWithMemo: 'issuer',
  pause: 'pause',
  setLogoURI: 'defaultAdmin',
  setNextQuoteToken: 'defaultAdmin',
  setSupplyCap: 'defaultAdmin',
  unpause: 'unpause',
}

/** @internal */
export const errorResolvers: Resolvers = {
  'ContractPaused()': ({ base, call }) =>
    isTip20(call?.address)
      ? new TokenPausedError({ ...base, token: call.address })
      : undefined,
  'InsufficientAllowance()': async (context) => {
    const { base, call, signer } = context
    const owner = call?.arg<Address.Address>('from')
    if (!isTip20(call?.address) || !owner || !signer) return undefined
    const token = call.address
    const [allowance, decimals] = await Promise.all([
      context.read({
        address: token,
        abi: Abis.tip20,
        functionName: 'allowance',
        args: [owner, signer.address],
      }),
      context.read({
        address: token,
        abi: Abis.tip20,
        functionName: 'decimals',
      }),
    ])
    return new TokenInsufficientAllowanceError({
      ...base,
      allowance,
      amount: call.arg<bigint>('amount'),
      decimals,
      owner,
      spender: signer.address,
      token,
    })
  },
  'InsufficientBalance(uint256,uint256,address)': async (context) => {
    // Selector-only revert data carries no arguments.
    const token = (
      context.base.error.args as readonly unknown[] | undefined
    )?.[2] as Address.Address | undefined
    if (!token) return undefined
    const decimals = await context.read({
      address: token,
      abi: Abis.tip20,
      functionName: 'decimals',
    })
    return new TokenInsufficientBalanceError({ ...context.base, decimals })
  },
  'PolicyForbids()': async (context) => {
    const { base, call, signer } = context
    if (!isTip20(call?.address)) return undefined
    const token = call.address
    // Mints only check the recipient.
    const mint = call.functionName.startsWith('mint')
    const from = mint
      ? undefined
      : (call.arg<Address.Address>('from') ?? signer?.address)
    const to = call.arg<Address.Address>('to')
    const policyId = await context.read({
      address: token,
      abi: Abis.tip20,
      functionName: 'transferPolicyId',
    })
    const registry = {
      address: Addresses.tip403Registry,
      abi: Abis.tip403Registry,
    } as const
    const [sender, recipient] =
      policyId === undefined
        ? []
        : await Promise.all([
            context.read({
              ...registry,
              functionName: 'isAuthorizedSender',
              args: [policyId, from ?? zeroAddress],
            }),
            mint
              ? context.read({
                  ...registry,
                  functionName: 'isAuthorizedMintRecipient',
                  args: [policyId, to ?? zeroAddress],
                })
              : context.read({
                  ...registry,
                  functionName: 'isAuthorizedRecipient',
                  args: [policyId, to ?? zeroAddress],
                }),
          ])
    return new TokenPolicyForbidsError({
      ...base,
      from,
      policyId,
      recipientAuthorized: to ? recipient : undefined,
      senderAuthorized: from ? sender : undefined,
      to,
      token,
    })
  },
  'SupplyCapExceeded()': async (context) => {
    const { base, call } = context
    if (!isTip20(call?.address)) return undefined
    const token = call.address
    const [supplyCap, totalSupply, decimals] = await Promise.all([
      context.read({
        address: token,
        abi: Abis.tip20,
        functionName: 'supplyCap',
      }),
      context.read({
        address: token,
        abi: Abis.tip20,
        functionName: 'totalSupply',
      }),
      context.read({
        address: token,
        abi: Abis.tip20,
        functionName: 'decimals',
      }),
    ])
    return new TokenSupplyCapExceededError({
      ...base,
      amount: call.arg<bigint>('amount'),
      decimals,
      supplyCap,
      token,
      totalSupply,
    })
  },
  'Unauthorized()': ({ base, call, signer }) => {
    const role = call && requiredRoles[call.functionName]
    if (!isTip20(call?.address) || !role || !signer) return undefined
    return new TokenUnauthorizedError({
      ...base,
      account: signer.address,
      role,
      token: call.address,
    })
  },
}
