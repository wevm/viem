import type { Abi } from 'abitype'

import type { PublicClient, Transport } from '../../clients/index.js'
import type { BaseError } from '../../errors/index.js'
import type {
  Chain,
  ContractFunctionConfig,
  GetValue,
} from '../../types/index.js'
import {
  encodeFunctionData,
  getContractError,
  parseAccount,
} from '../../utils/index.js'
import type { EncodeFunctionDataParameters } from '../../utils/index.js'
import { estimateGas } from './estimateGas.js'
import type { EstimateGasParameters } from './estimateGas.js'

export type EstimateContractGasParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TChain extends Chain | undefined = Chain | undefined,
> = ContractFunctionConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'> &
  Omit<EstimateGasParameters<TChain>, 'data' | 'to' | 'value'> &
  GetValue<TAbi, TFunctionName, EstimateGasParameters<TChain>['value']>

export type EstimateContractGasReturnType = bigint

export async function estimateContractGas<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChain extends Chain | undefined,
>(
  client: PublicClient<Transport, TChain>,
  {
    abi,
    address,
    args,
    functionName,
    ...request
  }: EstimateContractGasParameters<TAbi, TFunctionName, TChain>,
): Promise<EstimateContractGasReturnType> {
  const account = parseAccount(request.account)
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
      sender: account?.address,
    })
  }
}
