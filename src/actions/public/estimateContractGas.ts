import type { Abi } from 'abitype'

import type { PublicClient, Transport } from '../../clients'
import type { BaseError } from '../../errors'
import type { Chain, ContractFunctionConfig, GetValue } from '../../types'
import { encodeFunctionData, getContractError, parseAccount } from '../../utils'
import type { EncodeFunctionDataParameters } from '../../utils'
import { estimateGas } from './estimateGas'
import type { EstimateGasParameters } from './estimateGas'

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
