import type { Abi } from 'abitype'

import type { PublicClient, Transport } from '../../clients'
import type { BaseError } from '../../errors'
import type {
  Chain,
  ContractFunctionConfig,
  ContractFunctionResult,
} from '../../types'
import {
  decodeFunctionResult,
  encodeFunctionData,
  getContractError,
} from '../../utils'
import type {
  DecodeFunctionResultParameters,
  EncodeFunctionDataParameters,
} from '../../utils'
import { call } from './call'
import type { CallParameters } from './call'

export type ReadContractParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = Pick<CallParameters, 'blockNumber' | 'blockTag'> &
  ContractFunctionConfig<TAbi, TFunctionName, 'view' | 'pure'>

export type ReadContractReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = ContractFunctionResult<TAbi, TFunctionName>

export async function readContract<
  TChain extends Chain | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
>(
  client: PublicClient<Transport, TChain>,
  {
    abi,
    address,
    args,
    functionName,
    ...callRequest
  }: ReadContractParameters<TAbi, TFunctionName>,
): Promise<ReadContractReturnType<TAbi, TFunctionName>> {
  const calldata = encodeFunctionData({
    abi,
    args,
    functionName,
  } as unknown as EncodeFunctionDataParameters<TAbi, TFunctionName>)
  try {
    const { data } = await call(client, {
      data: calldata,
      to: address,
      ...callRequest,
    } as unknown as CallParameters)
    return decodeFunctionResult({
      abi,
      args,
      functionName,
      data: data || '0x',
    } as DecodeFunctionResultParameters<TAbi, TFunctionName>)
  } catch (err) {
    throw getContractError(err as BaseError, {
      abi: abi as Abi,
      address,
      args,
      docsPath: '/docs/contract/readContract',
      functionName,
    })
  }
}
