import type { Abi } from 'abitype'
import { AbiFunction } from 'ox'
import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as ContractError from '../../../core/ContractError.js'
import { isAbortError } from '../../../core/internal/errors.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionParameters,
  GetMutabilityAwareValue,
} from '../../../core/actions/internal/contract.js'
import { estimateL1Fee } from './estimateL1Fee.js'

/** Estimates the L1 data fee required to execute an L2 contract write. */
export async function estimateContractL1Fee<
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
  options: estimateContractL1Fee.Options<abi, functionName, args>,
): Promise<estimateContractL1Fee.ReturnType> {
  const { abi, address, args, functionName, ...request } =
    options as estimateContractL1Fee.Options
  const data = AbiFunction.encodeData(
    AbiFunction.fromAbi(abi, functionName, { args }),
    args,
  )
  try {
    return await estimateL1Fee(client, {
      ...request,
      data,
      to: address,
    } as estimateL1Fee.Options)
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

export declare namespace estimateContractL1Fee {
  /** Options for {@link estimateContractL1Fee}. */
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
    Omit<estimateL1Fee.Options, 'data' | 'to' | 'value'> &
    GetMutabilityAwareValue<
      abi,
      'nonpayable' | 'payable',
      functionName,
      NonNullable<estimateL1Fee.Options['value']>,
      args
    >

  /** Return type of {@link estimateContractL1Fee}. */
  type ReturnType = bigint

  /** Errors thrown by {@link estimateContractL1Fee}. */
  type ErrorType =
    | ContractError.fromError.ErrorType
    | AbiFunction.encodeData.ErrorType
    | AbiFunction.fromAbi.ErrorType
    | estimateL1Fee.ErrorType
    | Errors.GlobalErrorType
}
