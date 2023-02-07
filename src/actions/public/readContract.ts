import { Abi } from 'abitype'

import type { PublicClient } from '../../clients'
import { BaseError } from '../../errors'
import type {
  ContractConfig,
  ExtractResultFromAbi,
  Formatter,
} from '../../types'
import {
  EncodeFunctionDataArgs,
  decodeFunctionResult,
  encodeFunctionData,
  getContractError,
  DecodeFunctionResultArgs,
} from '../../utils'
import { call, CallArgs, FormattedCall } from './call'

export type FormattedReadContract<
  TFormatter extends Formatter | undefined = Formatter,
> = FormattedCall<TFormatter>

export type ReadContractArgs<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = any,
> = Omit<
  CallArgs,
  | 'accessList'
  | 'chain'
  | 'from'
  | 'gas'
  | 'gasPrice'
  | 'maxFeePerGas'
  | 'maxPriorityFeePerGas'
  | 'nonce'
  | 'to'
  | 'data'
  | 'value'
> &
  ContractConfig<TAbi, TFunctionName, 'view' | 'pure'>

export type ReadContractResponse<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = ExtractResultFromAbi<TAbi, TFunctionName>

export async function readContract<
  TAbi extends Abi = Abi,
  TFunctionName extends string = any,
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
      abi,
      address,
      args,
      docsPath: '/docs/contract/readContract',
      functionName,
    })
  }
}
