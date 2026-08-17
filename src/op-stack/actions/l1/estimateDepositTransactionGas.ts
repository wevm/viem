import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { estimateGas } from '../../../core/actions/contract/estimateGas.js'
import { portalAbi } from '../../abis.js'
import type * as Deposit from '../../Deposit.js'
import {
  type ContractParameters,
  type EstimateParameters,
  getContractAddress,
  zeroAddress,
} from './internal.js'

/** Estimates gas to deposit an L1 transaction onto an OP Stack L2. */
export async function estimateDepositTransactionGas<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: estimateDepositTransactionGas.Options,
): Promise<estimateDepositTransactionGas.ReturnType> {
  const {
    account,
    chain = client.chain,
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    request: {
      data = '0x',
      gas: l2Gas,
      isCreation = false,
      mint,
      to = zeroAddress,
      value,
    },
  } = options

  return estimateGas(client, {
    account,
    abi: portalAbi,
    address: getContractAddress({ ...options, chain }, 'portal'),
    args: [
      isCreation ? zeroAddress : to,
      value ?? mint ?? 0n,
      l2Gas,
      isCreation,
      data,
    ],
    functionName: 'depositTransaction',
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    value: mint,
  })
}

export declare namespace estimateDepositTransactionGas {
  /** Options for {@link estimateDepositTransactionGas}. */
  type Options = ContractParameters<'portal'> &
    EstimateParameters & {
      /** L2 transaction request. */
      request: Deposit.Request
    }

  /** Return type of {@link estimateDepositTransactionGas}. */
  type ReturnType = bigint

  /** Errors thrown by {@link estimateDepositTransactionGas}. */
  type ErrorType =
    | estimateGas.ErrorType
    | Chain.getContractAddress.ErrorType
    | Errors.GlobalErrorType
}
