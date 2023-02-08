import { Abi, Narrow } from 'abitype'

import type { PublicClient } from '../../clients'
import { BaseError } from '../../errors'
import type {
  Address,
  Chain,
  ContractConfig,
  ExtractArgsFromAbi,
  ExtractResultFromAbi,
  ExtractFunctionNameFromAbi,
  GetValue,
} from '../../types'
import {
  EncodeFunctionDataArgs,
  decodeFunctionResult,
  encodeFunctionData,
  getContractError,
  DecodeFunctionResultArgs,
} from '../../utils'
import { WriteContractArgs } from '../wallet'
import { call, CallArgs } from './call'

export type SimulateContractArgs<
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = any,
> = Omit<CallArgs<TChain>, 'to' | 'data' | 'value'> &
  ContractConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'> & {
    value?: GetValue<TAbi, TFunctionName, CallArgs<TChain>['value']>
  }

export type SimulateContractResponse<
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = {
  result: ExtractResultFromAbi<TAbi, TFunctionName>
  request: WriteContractArgs<TChain, TAbi, TFunctionName> &
    ContractConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'>
}

export async function simulateContract<
  TChain extends Chain,
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
  }: SimulateContractArgs<TChain, TAbi, TFunctionName>,
): Promise<SimulateContractResponse<TChain, TAbi, TFunctionName>> {
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
    } as unknown as CallArgs<TChain>)
    const result = decodeFunctionResult({
      abi,
      args,
      functionName,
      data: data || '0x',
    } as DecodeFunctionResultArgs)
    return {
      result,
      request: {
        abi,
        address,
        args,
        functionName,
        ...callRequest,
      },
    } as unknown as SimulateContractResponse<TChain, TAbi, TFunctionName>
  } catch (err) {
    throw getContractError(err as BaseError, {
      abi: abi as Abi,
      address,
      args,
      docsPath: '/docs/contract/simulateContract',
      functionName,
      sender: callRequest.from,
    })
  }
}
