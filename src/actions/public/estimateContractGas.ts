import type { Abi } from 'abitype'

import type { PublicClient } from '../../clients/index.js'
import type { BaseError } from '../../errors/index.js'
import type { Chain, ContractConfig, GetValue } from '../../types/index.js'
import {
  encodeFunctionData,
  EncodeFunctionDataParameters,
  getContractError,
} from '../../utils/index.js'
import { estimateGas, EstimateGasParameters } from './estimateGas.js'

export type EstimateContractGasParameters<
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = any,
> = Omit<EstimateGasParameters<TChain>, 'data' | 'to' | 'value'> &
  ContractConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'> & {
    value?: GetValue<
      TAbi,
      TFunctionName,
      EstimateGasParameters<TChain>['value']
    >
  }
export type EstimateContractGasReturnType = bigint

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
  }: EstimateContractGasParameters<TChain, TAbi, TFunctionName>,
): Promise<EstimateContractGasReturnType> {
  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as unknown as EncodeFunctionDataParameters<TAbi, TFunctionName>)
  try {
    const gas = await estimateGas(client, {
      data,
      to: address,
      ...request,
    } as unknown as EstimateGasParameters<TChain>)
    return gas
  } catch (err) {
    throw getContractError(err as BaseError, {
      abi: abi as Abi,
      address,
      args,
      docsPath: '/docs/contract/simulateContract',
      functionName,
      sender: request.account?.address,
    })
  }
}
