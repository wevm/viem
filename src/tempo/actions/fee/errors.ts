import { Address } from 'ox'

import * as viem_Account from '../../../core/Account.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import { TempoExecutionError } from '../../errors.js'
import {
  formatAmount,
  getFeeToken,
  type Resolvers,
} from '../../internal/errors.js'

const zeroAddress = '0x0000000000000000000000000000000000000000'

/** Errors this module throws for decoded Tempo errors. Narrow with `error.name`. */
export type ExecutionErrorType = FeeInsufficientBalanceErrorType

/** `FeeInsufficientBalanceError` with a literal `name`, for narrowing. */
export type FeeInsufficientBalanceErrorType = FeeInsufficientBalanceError & {
  name: 'FeeInsufficientBalanceError'
}

/** Thrown when an account cannot pay transaction fees in its fee token. */
export class FeeInsufficientBalanceError extends TempoExecutionError<
  TempoExecutionError.Decoded<'InsufficientFeeTokenBalance'>
> {
  /** Fee token balance, when known. */
  balance: bigint | undefined
  /** Token decimals, when known. */
  decimals: number | undefined
  /** Fee token, when known. */
  feeToken: Address.Address | undefined

  constructor(
    parameters: TempoExecutionError.Parameters & {
      balance?: bigint | undefined
      decimals?: number | undefined
      feeToken?: Address.Address | undefined
    },
  ) {
    const { balance, decimals, feeToken } = parameters
    super(parameters, {
      details: {
        'fee token': feeToken,
        balance: formatAmount(balance, decimals),
      },
      name: 'FeeInsufficientBalanceError',
      shortMessage: `Insufficient balance to pay fees${feeToken ? ` in token "${feeToken}"` : ''}.`,
    })
    this.balance = balance
    this.decimals = decimals
    this.feeToken = feeToken
  }
}

/** @internal */
export const errorResolvers: Resolvers = {
  'InsufficientFeeTokenBalance()': async (context) => {
    const { feePayer } = context.parameters
    // A local fee payer pays instead of the sender. External fee payers cannot be read.
    const payer =
      typeof feePayer === 'object' && feePayer !== null
        ? viem_Account.from(feePayer).address
        : feePayer
          ? undefined
          : context.signer?.address
    if (!payer) return new FeeInsufficientBalanceError(context.base)
    const userToken = getFeeToken(context)
      ? undefined
      : await context.read({
          address: Addresses.feeManager,
          abi: Abis.feeManager,
          functionName: 'userTokens',
          args: [payer],
        })
    const feeToken =
      getFeeToken(context) ??
      (userToken && !Address.isEqual(userToken, zeroAddress)
        ? userToken
        : undefined)
    if (!feeToken) return new FeeInsufficientBalanceError(context.base)
    const [balance, decimals] = await Promise.all([
      context.read({
        address: feeToken,
        abi: Abis.tip20,
        functionName: 'balanceOf',
        args: [payer],
      }),
      context.read({
        address: feeToken,
        abi: Abis.tip20,
        functionName: 'decimals',
      }),
    ])
    return new FeeInsufficientBalanceError({
      ...context.base,
      balance,
      decimals,
      feeToken,
    })
  },
}
