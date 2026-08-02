import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { write } from '../../../core/actions/contract/write.js'
import { portal2Abi } from '../../abis.js'
import type { estimateProveWithdrawalGas } from './estimateProveWithdrawalGas.js'
import {
  type ContractParameters,
  type WriteParameters,
  getContractAddress,
} from './internal.js'

/** Proves an OP Stack withdrawal on L1. */
export async function proveWithdrawal<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: proveWithdrawal.Options<account>,
): Promise<proveWithdrawal.ReturnType> {
  const {
    account = client.account,
    chain = client.chain,
    gas,
    l2OutputIndex,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    outputRootProof,
    withdrawalProof,
    withdrawal,
  } = options

  return write(client as Client.Client, {
    account,
    abi: portal2Abi,
    address: getContractAddress({ ...options, chain }, 'portal'),
    args: [withdrawal, l2OutputIndex, outputRootProof, withdrawalProof],
    chain,
    functionName: 'proveWithdrawalTransaction',
    gas: gas ?? undefined,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
  })
}

export declare namespace proveWithdrawal {
  /** Options for {@link proveWithdrawal}. */
  type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = ContractParameters<'portal'> &
    WriteParameters<account> &
    Pick<
      estimateProveWithdrawalGas.Options,
      'l2OutputIndex' | 'outputRootProof' | 'withdrawalProof' | 'withdrawal'
    >

  /** Return type of {@link proveWithdrawal}. */
  type ReturnType = write.ReturnType

  /** Errors thrown by {@link proveWithdrawal}. */
  type ErrorType =
    | write.ErrorType
    | Chain.getContractAddress.ErrorType
    | Errors.GlobalErrorType
}
