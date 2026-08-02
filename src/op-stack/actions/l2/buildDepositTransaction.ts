import type { Address, Errors, Hex } from 'ox'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { prepare } from '../../../core/actions/transaction/prepare.js'
import * as Deposit from '../../Deposit.js'

/** Prepares parameters for depositing a transaction from L1 to L2. */
export async function buildDepositTransaction<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  const chainOverride extends Chain.Chain | undefined = undefined,
  const accountOverride extends Account.Account | Address.Address | undefined =
    undefined,
>(
  client: Client.Client<chain, account>,
  options: buildDepositTransaction.Options<chainOverride, accountOverride>,
): Promise<
  buildDepositTransaction.ReturnType<chain, chainOverride, accountOverride>
> {
  const {
    account: account_,
    chain = client.chain,
    data,
    gas,
    isCreation,
    mint,
    to,
    value,
  } = options
  const account = account_
    ? typeof account_ === 'string'
      ? Account.from(account_)
      : account_
    : undefined
  const prepareOptions = {
    account: mint ? undefined : account,
    chain: chain ?? undefined,
    data,
    gas,
    parameters: ['gas'],
    to,
    value,
  } as prepare.Options<chain> & { parameters: readonly ['gas'] }
  const { request } = await prepare(client, prepareOptions)
  return {
    account,
    request: {
      data: request.data,
      gas: request.gas,
      isCreation,
      mint,
      to: request.to ?? undefined,
      value: request.value as bigint | undefined,
    } as Deposit.Request,
    targetChain: chain,
  } as buildDepositTransaction.ReturnType<chain, chainOverride, accountOverride>
}

export declare namespace buildDepositTransaction {
  /** Options for {@link buildDepositTransaction}. */
  type Options<
    chainOverride extends Chain.Chain | undefined = Chain.Chain | undefined,
    accountOverride extends Account.Account | Address.Address | undefined =
      | Account.Account
      | Address.Address
      | undefined,
  > = {
    /** Account (or address) that initiates the deposit. */
    account?: accountOverride | undefined
    /** L2 chain the transaction targets. @default client.chain */
    chain?: chainOverride | undefined
    /** Gas limit for transaction execution on L2. */
    gas?: bigint | undefined
    /** Value in wei to mint on L2. */
    mint?: bigint | undefined
    /** Value in wei sent with the transaction on L2. */
    value?: bigint | undefined
  } & (
    | {
        /** Encoded contract method and arguments. */
        data?: Hex.Hex | undefined
        /** Whether the transaction deploys a contract. */
        isCreation?: false | undefined
        /** L2 transaction recipient. */
        to?: Address.Address | undefined
      }
    | {
        /** Contract deployment bytecode. */
        data: Hex.Hex
        /** Whether the transaction deploys a contract. */
        isCreation: true
        /** Contract deployments cannot specify a recipient. */
        to?: undefined
      }
  )

  /** Return type of {@link buildDepositTransaction}. */
  type ReturnType<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    chainOverride extends Chain.Chain | undefined = Chain.Chain | undefined,
    accountOverride extends Account.Account | Address.Address | undefined =
      | Account.Account
      | Address.Address
      | undefined,
  > = {
    /** Account that initiates the deposit. */
    account: accountOverride extends Account.Account | Address.Address
      ? Account.from.ReturnType<accountOverride>
      : undefined
    /** Prepared deposit request. */
    request: Deposit.Request
    /** L2 chain the transaction targets. */
    targetChain: chainOverride extends undefined ? chain : chainOverride
  }

  /** Errors thrown by {@link buildDepositTransaction}. */
  type ErrorType =
    | Account.from.ErrorType
    | prepare.ErrorType
    | Errors.GlobalErrorType
}
