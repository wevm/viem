import type { Address, Errors, Hex } from 'ox'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { BaseError } from '../../../core/Errors.js'
import { prepare } from '../../../core/actions/transaction/prepare.js'
import type * as Withdrawal from '../../Withdrawal.js'

/** Prepares an L2 withdrawal request for submission. */
export async function buildInitiateWithdrawal<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  const accountOverride extends Account.Account | Address.Address | undefined =
    undefined,
>(
  client: Client.Client<chain, account>,
  options: buildInitiateWithdrawal.Options<accountOverride>,
): Promise<buildInitiateWithdrawal.ReturnType<accountOverride>> {
  const {
    account: account_,
    chain = client.chain,
    data,
    gas,
    to,
    value,
  } = options
  const account = account_ ? Account.from(account_) : undefined

  const prepareOptions = {
    chain,
    data,
    gas,
    parameters: ['gas'],
    to,
    value,
  } as prepare.Options<chain> & { parameters: readonly ['gas'] }
  const { request } = await prepare(
    { ...client, account: undefined },
    prepareOptions,
  )

  if (request.gas === undefined || !request.to)
    throw new WithdrawalPreparationError()

  return {
    account,
    request: {
      data: request.data,
      gas: typeof request.gas === 'bigint' ? request.gas : BigInt(request.gas),
      to: request.to,
      value:
        request.value === undefined
          ? undefined
          : typeof request.value === 'bigint'
            ? request.value
            : BigInt(request.value),
    },
  } as buildInitiateWithdrawal.ReturnType<accountOverride>
}

export declare namespace buildInitiateWithdrawal {
  /** Options for {@link buildInitiateWithdrawal}. */
  type Options<
    accountOverride extends Account.Account | Address.Address | undefined =
      | Account.Account
      | Address.Address
      | undefined,
  > = {
    /** Account to submit the prepared withdrawal with. */
    account?: accountOverride | undefined
    /** Chain the withdrawal is initiated on. @default client.chain */
    chain?: Chain.Chain | undefined
    /** Encoded contract method and arguments. */
    data?: Hex.Hex | undefined
    /** Gas limit for execution on L1. */
    gas?: bigint | undefined
    /** L1 recipient. */
    to: Address.Address
    /** Value withdrawn to L1. */
    value?: bigint | undefined
  }

  /** Prepared withdrawal parameters. */
  type ReturnType<
    accountOverride extends Account.Account | Address.Address | undefined =
      | Account.Account
      | Address.Address
      | undefined,
  > = {
    /** Parsed account, if supplied. */
    account: accountOverride extends Account.Account | Address.Address
      ? Account.from.ReturnType<accountOverride>
      : undefined
    /** Withdrawal request. */
    request: Withdrawal.Request
  }

  /** Errors thrown by {@link buildInitiateWithdrawal}. */
  type ErrorType =
    | Account.from.ErrorType
    | prepare.ErrorType
    | WithdrawalPreparationError
    | Errors.GlobalErrorType
}

/** Thrown when a withdrawal request cannot be prepared. */
export class WithdrawalPreparationError extends BaseError {
  override readonly name =
    'Actions.l1.buildInitiateWithdrawal.WithdrawalPreparationError'

  constructor() {
    super('Could not prepare the withdrawal request.')
  }
}
