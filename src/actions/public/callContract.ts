import { Abi } from 'abitype'

import type { Chain, Formatter } from '../../chains'
import type { PublicClient } from '../../clients'
import type {
  Address,
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
} from '../../utils'
import { call, CallArgs, FormattedCall } from './call'

export type FormattedCallContract<
  TFormatter extends Formatter | undefined = Formatter,
> = FormattedCall<TFormatter>

export type CallContractArgs<
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = any,
> = Omit<CallArgs<TChain>, 'from' | 'to' | 'data' | 'value'> & {
  address: Address
  abi: TAbi
  from?: Address
  functionName: ExtractFunctionNameFromAbi<TAbi, TFunctionName>
  value?: GetValue<TAbi, TFunctionName, CallArgs<TChain>['value']>
} & ExtractArgsFromAbi<TAbi, TFunctionName>

export type CallContractResponse<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = ExtractResultFromAbi<TAbi, TFunctionName>

export async function callContract<
  TChain extends Chain,
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
  }: CallContractArgs<TChain, TAbi, TFunctionName>,
): Promise<CallContractResponse<TAbi, TFunctionName>> {
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
    return decodeFunctionResult({
      abi,
      functionName,
      data: data || '0x',
    }) as CallContractResponse<TAbi, TFunctionName>
  } catch (err) {
    throw getContractError(err, {
      abi,
      address,
      args,
      functionName,
      sender: callRequest.from,
    })
  }
}
