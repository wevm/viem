import type { Address, Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { estimateGas } from '../../../core/actions/contract/estimateGas.js'
import * as Withdrawal from '../../Withdrawal.js'
import { portal2Abi, portalAbi } from '../../abis.js'
import {
  type ContractParameters,
  type EstimateParameters,
  getContractAddress,
} from './internal.js'

/** Estimates gas to finalize an OP Stack withdrawal on L1. */
export async function estimateFinalizeWithdrawalGas<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: estimateFinalizeWithdrawalGas.Options,
): Promise<estimateFinalizeWithdrawalGas.ReturnType> {
  const {
    account,
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
    return estimateGas(client, {
      account,
      abi: portal2Abi,
      address,
      args: [withdrawal, proofSubmitter],
      functionName: 'finalizeWithdrawalTransactionExternalProof',
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
    })

  return estimateGas(client, {
    account,
    abi: portalAbi,
    address,
    args: [withdrawal],
    functionName: 'finalizeWithdrawalTransaction',
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
  })
}

export declare namespace estimateFinalizeWithdrawalGas {
  /** Options for {@link estimateFinalizeWithdrawalGas}. */
  type Options = ContractParameters<'portal'> &
    EstimateParameters & {
      /** Proof submitter used for external-proof finalization. */
      proofSubmitter?: Address.Address | null | undefined
      /** Withdrawal to finalize. */
      withdrawal: Withdrawal.Withdrawal
    }

  /** Return type of {@link estimateFinalizeWithdrawalGas}. */
  type ReturnType = bigint

  /** Errors thrown by {@link estimateFinalizeWithdrawalGas}. */
  type ErrorType =
    | estimateGas.ErrorType
    | Chain.getContractAddress.ErrorType
    | Errors.GlobalErrorType
}
