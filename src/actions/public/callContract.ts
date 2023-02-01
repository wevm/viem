import { Abi, AbiParameter } from 'abitype'

import type { Chain, Formatter } from '../../chains'
import type { PublicClient } from '../../clients'
import {
  AbiDecodingZeroDataError,
  BaseError,
  ContractMethodExecutionError,
  ContractMethodZeroDataError,
} from '../../errors'
import type {
  Address,
  ExtractArgsFromAbi,
  ExtractResultFromAbi,
  ExtractFunctionNameFromAbi,
  GetValue,
} from '../../types'
import {
  decodeFunctionResult,
  encodeFunctionData,
  formatAbiItemWithArgs,
  formatAbiItemWithParams,
  getAbiItem,
  isAddress,
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
  } as any)
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

export function getContractError(
  err: unknown,
  {
    abi,
    address,
    args,
    functionName,
    sender,
  }: {
    abi: Abi
    args: any
    address?: Address
    functionName: string
    sender?: Address
  },
) {
  const { code, message } =
    ((err as Error).cause as { code?: number; message?: string }) || {}

  const abiItem = getAbiItem({ abi, name: functionName })
  const formattedArgs = abiItem
    ? formatAbiItemWithArgs({
        abiItem,
        args,
        includeFunctionName: false,
        includeName: false,
      })
    : undefined
  const functionWithParams = abiItem
    ? formatAbiItemWithParams(abiItem, { includeName: true })
    : undefined

  if (err instanceof AbiDecodingZeroDataError) {
    return new ContractMethodZeroDataError({
      abi,
      args,
      cause: err as Error,
      contractAddress: address,
      functionName,
      functionWithParams,
    })
  }
  if (code === 3 || message?.includes('execution reverted')) {
    const message_ = message?.replace('execution reverted: ', '')
    return new ContractMethodExecutionError(message_, {
      abi,
      args,
      cause: err as Error,
      contractAddress: address,
      formattedArgs,
      functionName,
      functionWithParams,
      sender,
    })
  }
  return err
}
