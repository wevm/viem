import { Abi, Narrow } from 'abitype'

import type { PublicClient } from '../../clients'
import { BaseError } from '../../errors'
import type {
  Chain,
  ContractConfig,
  ExtractResultFromAbi,
  GetValue,
} from '../../types'
import {
  DecodeFunctionResultParameters,
  EncodeFunctionDataParameters,
  decodeFunctionResult,
  encodeFunctionData,
  getContractError,
} from '../../utils'
import { WriteContractParameters } from '../wallet'
import { call, CallParameters } from './call'

export type SimulateContractParameters<
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = any,
  TChainOverride extends Chain | undefined = undefined,
> = Omit<
  CallParameters<TChainOverride extends Chain ? TChainOverride : TChain>,
  'to' | 'data' | 'value'
> & {
  chain?: TChainOverride
} & ContractConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'> & {
    value?: GetValue<TAbi, TFunctionName, CallParameters<TChain>['value']>
  }

export type SimulateContractReturnType<
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = {
  result: ExtractResultFromAbi<TAbi, TFunctionName>
  request: WriteContractParameters<TChain, TAbi, TFunctionName> &
    ContractConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'>
}

export async function simulateContract<
  TChain extends Chain,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChainOverride extends Chain | undefined,
>(
  client: PublicClient<any, TChain>,
  {
    abi,
    address,
    args,
    functionName,
    ...callRequest
  }: SimulateContractParameters<TChain, TAbi, TFunctionName, TChainOverride>,
): Promise<
  SimulateContractReturnType<
    TChainOverride extends Chain ? TChainOverride : TChain,
    TAbi,
    TFunctionName
  >
> {
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
    } as unknown as CallParameters<TChain>)
    const result = decodeFunctionResult({
      abi,
      args,
      functionName,
      data: data || '0x',
    } as DecodeFunctionResultParameters)
    return {
      result,
      request: {
        abi,
        address,
        args,
        functionName,
        ...callRequest,
      },
    } as unknown as SimulateContractReturnType<
      TChainOverride extends Chain ? TChainOverride : TChain,
      TAbi,
      TFunctionName
    >
  } catch (err) {
    throw getContractError(err as BaseError, {
      abi: abi as Abi,
      address,
      args,
      docsPath: '/docs/contract/simulateContract',
      functionName,
      sender: callRequest.account?.address,
    })
  }
}
