import type { Abi } from 'abitype'
import { AbiFunction } from 'ox'
import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as ContractError from '../../../core/ContractError.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionParameters,
  GetMutabilityAwareValue,
} from '../../../core/actions/internal/contract.js'
import { isAbortError } from '../../../core/internal/errors.js'
import { estimateTotalGas } from './estimateTotalGas.js'

/** Estimates the total gas required to execute an L2 contract write. */
export async function estimateContractTotalGas<
  chain extends Chain.Chain | undefined,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  const args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
>(
  client: Client.Client<chain>,
  options: estimateContractTotalGas.Options<abi, functionName, args>,
): Promise<estimateContractTotalGas.ReturnType> {
  const { abi, address, args, functionName, ...request } =
    options as estimateContractTotalGas.Options
  const data = AbiFunction.encodeData(
    AbiFunction.fromAbi(abi, functionName, { args }),
    args,
  )
  try {
    return await estimateTotalGas(client, {
      ...request,
      data,
      to: address,
    } as estimateTotalGas.Options)
  } catch (error) {
    if (isAbortError(error)) throw error
    const account = request.account
    throw ContractError.fromError(error as Error, {
      abi,
      address,
      args,
      functionName,
      sender: typeof account === 'string' ? account : account?.address,
    })
  }
}

export declare namespace estimateContractTotalGas {
  /** Options for {@link estimateContractTotalGas}. */
  type Options<
    abi extends Abi | readonly unknown[] = Abi,
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> =
      ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<
      abi,
      'nonpayable' | 'payable',
      functionName
    > = ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
  > = ContractFunctionParameters<
    abi,
    'nonpayable' | 'payable',
    functionName,
    args
  > &
    Omit<estimateTotalGas.Options, 'data' | 'to' | 'value'> &
    GetMutabilityAwareValue<
      abi,
      'nonpayable' | 'payable',
      functionName,
      NonNullable<estimateTotalGas.Options['value']>,
      args
    >

  /** Return type of {@link estimateContractTotalGas}. */
  type ReturnType = bigint

  /** Errors thrown by {@link estimateContractTotalGas}. */
  type ErrorType =
    | ContractError.fromError.ErrorType
    | AbiFunction.encodeData.ErrorType
    | AbiFunction.fromAbi.ErrorType
    | estimateTotalGas.ErrorType
    | Errors.GlobalErrorType
}
