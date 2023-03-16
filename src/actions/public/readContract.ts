import type { Abi } from 'abitype'

import type { PublicClient } from '../../clients'
import type { BaseError } from '../../errors'
import type { ContractConfig, ExtractResultFromAbi } from '../../types'
import {
  decodeFunctionResult,
  DecodeFunctionResultParameters,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  getContractError,
} from '../../utils'
import { call, CallParameters } from './call'

export type ReadContractParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = Pick<CallParameters, 'blockNumber' | 'blockTag'> &
  ContractConfig<TAbi, TFunctionName, 'view' | 'pure'>

export type ReadContractReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = ExtractResultFromAbi<TAbi, TFunctionName>

export async function readContract<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
>(
  client: PublicClient,
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
