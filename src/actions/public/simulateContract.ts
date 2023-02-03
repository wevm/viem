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
import { WriteContractArgs } from '../wallet'
import { call, CallArgs, FormattedCall } from './call'

export type FormattedSimulateContract<
  TFormatter extends Formatter | undefined = Formatter,
> = FormattedCall<TFormatter>

export type SimulateContractArgs<
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = any,
> = Omit<CallArgs<TChain>, 'to' | 'data' | 'value'> & {
  address: Address
  abi: TAbi
  functionName: ExtractFunctionNameFromAbi<
    TAbi,
    TFunctionName,
    'payable' | 'nonpayable'
  >
  value?: GetValue<TAbi, TFunctionName, CallArgs<TChain>['value']>
} & ExtractArgsFromAbi<TAbi, TFunctionName>

export type SimulateContractResponse<
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = {
  result: ExtractResultFromAbi<TAbi, TFunctionName>
  request: WriteContractArgs<TChain, TAbi, TFunctionName> & {
    address: Address
    abi: TAbi
    functionName: ExtractFunctionNameFromAbi<TAbi, TFunctionName>
  } & ExtractArgsFromAbi<TAbi, TFunctionName>
}

export async function simulateContract<
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
      functionName,
      data: data || '0x',
    })
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
    throw getContractError(err, {
      abi,
      address,
      args,
      functionName,
      sender: callRequest.from,
    })
  }
}
