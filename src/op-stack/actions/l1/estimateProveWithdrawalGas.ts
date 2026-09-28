import type { Address, Errors, Hex } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { estimateGas } from '../../../core/actions/contract/estimateGas.js'
import { portal2Abi } from '../../abis.js'
import {
  type ContractParameters,
  type EstimateParameters,
  getContractAddress,
} from './internal.js'

/** Estimates gas to prove an OP Stack withdrawal on L1. */
export async function estimateProveWithdrawalGas<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: estimateProveWithdrawalGas.Options,
): Promise<estimateProveWithdrawalGas.ReturnType> {
  const {
    account,
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

  return estimateGas(client, {
    account,
    abi: portal2Abi,
    address: getContractAddress({ ...options, chain }, 'portal'),
    args: [withdrawal, l2OutputIndex, outputRootProof, withdrawalProof],
    functionName: 'proveWithdrawalTransaction',
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
  })
}

export declare namespace estimateProveWithdrawalGas {
  /** Options for {@link estimateProveWithdrawalGas}. */
  type Options = ContractParameters<'portal'> &
    EstimateParameters & {
      /** L2 output or dispute-game index. */
      l2OutputIndex: bigint
      /** Output-root proof for the withdrawal block. */
      outputRootProof: OutputRootProof
      /** Merkle proof for the withdrawal storage slot. */
      withdrawalProof: readonly Hex.Hex[]
      /** Withdrawal transaction fields. */
      withdrawal: Withdrawal
    }

  /** Output-root proof passed to the portal. */
  type OutputRootProof = {
    /** Latest L2 block hash. */
    latestBlockhash: Hex.Hex
    /** L2ToL1MessagePasser storage root. */
    messagePasserStorageRoot: Hex.Hex
    /** L2 state root. */
    stateRoot: Hex.Hex
    /** Output-root proof version. */
    version: Hex.Hex
  }

  /** Withdrawal tuple passed to the portal. */
  type Withdrawal = {
    /** Withdrawal calldata. */
    data: Hex.Hex
    /** Minimum L1 gas. */
    gasLimit: bigint
    /** Withdrawal nonce. */
    nonce: bigint
    /** L2 sender. */
    sender: Address.Address
    /** L1 target. */
    target: Address.Address
    /** Withdrawal value. */
    value: bigint
  }

  /** Return type of {@link estimateProveWithdrawalGas}. */
  type ReturnType = bigint

  /** Errors thrown by {@link estimateProveWithdrawalGas}. */
  type ErrorType =
    | estimateGas.ErrorType
    | Chain.getContractAddress.ErrorType
    | Errors.GlobalErrorType
}
