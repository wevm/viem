import { Abi } from 'abitype'

import type { PublicClient } from '../../clients'
import { BaseError, EstimateGasExecutionError } from '../../errors'
import type { Chain, ContractConfig, GetValue } from '../../types'
import {
  EncodeFunctionDataArgs,
  encodeFunctionData,
  getContractError,
} from '../../utils'
import { CallArgs } from './call'
import { estimateGas } from './estimateGas'

export type EstimateContractGasArgs<
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = any,
> = Omit<CallArgs<TChain>, 'to' | 'data' | 'value'> &
  ContractConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'> & {
    value?: GetValue<TAbi, TFunctionName, CallArgs<TChain>['value']>
  }
export type EstimateContractGasResponse = bigint

export async function estimateContractGas<
  TChain extends Chain,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
>(
  client: PublicClient<any, TChain>,
  {
    abi,
    address,
    args,
    functionName,
    ...request
  }: EstimateContractGasArgs<TChain, TAbi, TFunctionName>,
): Promise<EstimateContractGasResponse> {
  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as unknown as EncodeFunctionDataArgs<TAbi, TFunctionName>)
  try {
    const gas = await estimateGas(client, {
      data,
      to: address,
      ...request,
    } as unknown as CallArgs<TChain>)
    return gas
  } catch (err) {
    throw getContractError(err as BaseError, {
      abi: abi as Abi,
      address,
      args,
      docsPath: '/docs/contract/simulateContract',
      functionName,
      sender: request.from,
    })
  }
}
