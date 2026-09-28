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
import { estimateL1Gas } from './estimateL1Gas.js'

/** Estimates the L1 data gas required to execute an L2 contract write. */
export async function estimateContractL1Gas<
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
  options: estimateContractL1Gas.Options<abi, functionName, args>,
): Promise<estimateContractL1Gas.ReturnType> {
  const { abi, address, args, functionName, ...request } =
    options as estimateContractL1Gas.Options
  const data = AbiFunction.encodeData(
    AbiFunction.fromAbi(abi, functionName, { args }),
    args,
  )
  try {
    return await estimateL1Gas(client, {
      ...request,
      data,
      to: address,
    } as estimateL1Gas.Options)
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

export declare namespace estimateContractL1Gas {
  /** Options for {@link estimateContractL1Gas}. */
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
    Omit<estimateL1Gas.Options, 'data' | 'to' | 'value'> &
    GetMutabilityAwareValue<
      abi,
      'nonpayable' | 'payable',
      functionName,
      NonNullable<estimateL1Gas.Options['value']>,
      args
    >

  /** Return type of {@link estimateContractL1Gas}. */
  type ReturnType = bigint

  /** Errors thrown by {@link estimateContractL1Gas}. */
  type ErrorType =
    | ContractError.fromError.ErrorType
    | AbiFunction.encodeData.ErrorType
    | AbiFunction.fromAbi.ErrorType
    | estimateL1Gas.ErrorType
    | Errors.GlobalErrorType
}
