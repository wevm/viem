import { Address } from 'ox'

import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import { TempoExecutionError } from '../../errors.js'
import type { Context, Resolvers } from '../../internal/errors.js'

/** Errors this module throws for decoded Tempo errors. Narrow with `error.name`. */
export type ExecutionErrorType = AmmInsufficientLiquidityErrorType

/** `AmmInsufficientLiquidityError` with a literal `name`, for narrowing. */
export type AmmInsufficientLiquidityErrorType =
  AmmInsufficientLiquidityError & {
    name: 'AmmInsufficientLiquidityError'
  }

/** Thrown when a fee AMM pool cannot cover a swap, deposit, or withdrawal. */
export class AmmInsufficientLiquidityError extends TempoExecutionError<
  TempoExecutionError.Decoded<'InsufficientLiquidity' | 'InsufficientReserves'>
> {
  /** Amount of the call (`amountOut`, `amountValidatorToken`, or `liquidity`). */
  amount: bigint | undefined
  /** Pool reserve of `userToken`, when known. */
  reserveUserToken: bigint | undefined
  /** Pool reserve of `validatorToken`, when known. */
  reserveValidatorToken: bigint | undefined
  /** User token of the pool. */
  userToken: Address.Address | undefined
  /** Validator token of the pool. */
  validatorToken: Address.Address | undefined

  constructor(
    parameters: TempoExecutionError.Parameters & {
      amount?: bigint | undefined
      reserveUserToken?: bigint | undefined
      reserveValidatorToken?: bigint | undefined
      userToken?: Address.Address | undefined
      validatorToken?: Address.Address | undefined
    },
  ) {
    const {
      amount,
      reserveUserToken,
      reserveValidatorToken,
      userToken,
      validatorToken,
    } = parameters
    super(parameters, {
      details: {
        'user token': userToken,
        'validator token': validatorToken,
        amount,
        'user token reserve': reserveUserToken,
        'validator token reserve': reserveValidatorToken,
      },
      name: 'AmmInsufficientLiquidityError',
    })
    this.amount = amount
    this.reserveUserToken = reserveUserToken
    this.reserveValidatorToken = reserveValidatorToken
    this.userToken = userToken
    this.validatorToken = validatorToken
  }
}

async function resolvePool(context: Context) {
  const { call } = context
  if (!call || !Address.isEqual(call.address, Addresses.feeManager))
    return undefined
  const userToken = call.arg<Address.Address>('userToken')
  const validatorToken = call.arg<Address.Address>('validatorToken')
  if (!userToken || !validatorToken) return undefined
  const pool = await context.read({
    address: Addresses.feeManager,
    abi: Abis.feeAmm,
    functionName: 'getPool',
    args: [userToken, validatorToken],
  })
  return new AmmInsufficientLiquidityError({
    ...context.base,
    amount:
      call.arg<bigint>('amountOut') ??
      call.arg<bigint>('amountValidatorToken') ??
      call.arg<bigint>('liquidity'),
    reserveUserToken: pool?.reserveUserToken,
    reserveValidatorToken: pool?.reserveValidatorToken,
    userToken,
    validatorToken,
  })
}

/** @internal */
export const errorResolvers: Resolvers = {
  'InsufficientLiquidity()': resolvePool,
  'InsufficientReserves()': resolvePool,
}
