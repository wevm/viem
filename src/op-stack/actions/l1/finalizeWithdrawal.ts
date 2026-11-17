import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { write } from '../../../core/actions/contract/write.js'
import * as Withdrawal from '../../Withdrawal.js'
import { portal2Abi, portalAbi } from '../../abis.js'
import {
  type ContractParameters,
  type WriteParameters,
  getContractAddress,
} from './internal.js'

/** Finalizes an OP Stack withdrawal on L1. */
export async function finalizeWithdrawal<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: finalizeWithdrawal.Options<account>,
): Promise<finalizeWithdrawal.ReturnType> {
  const {
    account = client.account,
    chain = client.chain,
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    proofSubmitter,
    withdrawal,
  } = options
  const address = getContractAddress({ ...options, chain }, 'portal')

  if (proofSubmitter)
    return write(client as Client.Client, {
      account,
      abi: portal2Abi,
      address,
      args: [withdrawal, proofSubmitter],
      chain,
      functionName: 'finalizeWithdrawalTransactionExternalProof',
      gas: gas ?? undefined,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
    })

  return write(client as Client.Client, {
    account,
    abi: portalAbi,
    address,
    args: [withdrawal],
    chain,
    functionName: 'finalizeWithdrawalTransaction',
    gas: gas ?? undefined,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
  })
}

export declare namespace finalizeWithdrawal {
  /** Options for {@link finalizeWithdrawal}. */
  type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = ContractParameters<'portal'> &
    WriteParameters<account> & {
      /** Proof submitter used for external-proof finalization. */
      proofSubmitter?: Address.Address | null | undefined
      /** Withdrawal to finalize. */
      withdrawal: Withdrawal.Withdrawal
    }

  /** Return type of {@link finalizeWithdrawal}. */
  type ReturnType = write.ReturnType

  /** Errors thrown by {@link finalizeWithdrawal}. */
  type ErrorType =
    | write.ErrorType
    | Chain.getContractAddress.ErrorType
    | Errors.GlobalErrorType
}
