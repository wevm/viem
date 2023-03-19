import type { Abi } from 'abitype'
import { parseAccount } from '../../accounts'

import type { PublicClientArg, Transport } from '../../clients'
import type { BaseError } from '../../errors'
import type {
  Chain,
  ContractConfig,
  ExtractResultFromAbi,
  GetValue,
} from '../../types'
import {
  decodeFunctionResult,
  DecodeFunctionResultParameters,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  getContractError,
} from '../../utils'
import type { WriteContractParameters } from '../wallet'
import { call, CallParameters } from './call'

export type SimulateContractParameters<
  TChain extends Chain | undefined = Chain,
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
  TChain extends Chain | undefined = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TChainOverride extends Chain | undefined = TChain,
> = {
  result: ExtractResultFromAbi<TAbi, TFunctionName>
  request: Omit<
    WriteContractParameters<
      TChain,
      TAbi,
      TFunctionName,
      undefined,
      TChainOverride
    >,
    'chain'
  > & {
    chain: TChainOverride
  } & ContractConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'>
}

export async function simulateContract<
  TChain extends Chain | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChainOverride extends Chain | undefined,
>(
  client: PublicClientArg<Transport, TChain>,
  {
    abi,
    address,
    args,
    functionName,
    ...callRequest
  }: SimulateContractParameters<TChain, TAbi, TFunctionName, TChainOverride>,
): Promise<
  SimulateContractReturnType<TChain, TAbi, TFunctionName, TChainOverride>
> {
  const account = callRequest.account
    ? parseAccount(callRequest.account)
    : undefined
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
      TChain,
      TAbi,
      TFunctionName,
      TChainOverride
    >
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
