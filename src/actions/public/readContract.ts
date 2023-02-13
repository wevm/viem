import { Abi } from 'abitype'

import type { PublicClient } from '../../clients'
import { BaseError } from '../../errors'
import type { ContractConfig, ExtractResultFromAbi } from '../../types'
import {
  EncodeFunctionDataArgs,
  decodeFunctionResult,
  encodeFunctionData,
  getContractError,
  DecodeFunctionResultArgs,
} from '../../utils'
import { call, CallArgs } from './call'

export type ReadContractArgs<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = Pick<CallArgs, 'blockNumber' | 'blockTag'> &
  ContractConfig<TAbi, TFunctionName, 'view' | 'pure'>

export type ReadContractResponse<
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
  }: ReadContractArgs<TAbi, TFunctionName>,
): Promise<ReadContractResponse<TAbi, TFunctionName>> {
  const calldata = encodeFunctionData({
    abi,
    args,
    functionName,
  } as unknown as EncodeFunctionDataArgs<TAbi, TFunctionName>)
  try {
    const { data } = await call(client, {
      data: calldata,
      to: address,
      ...callRequest,
    } as unknown as CallArgs)
    return decodeFunctionResult({
      abi,
      args,
      functionName,
      data: data || '0x',
    } as DecodeFunctionResultArgs<TAbi, TFunctionName>)
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
