import type { Abi } from 'abitype'

import type { PublicClient } from '../../clients'
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

/**
 * Simulates/validates a contract interaction. This is useful for retrieving return data and revert reasons of contract write functions.
 *
 * This function does not require gas to execute and does not change the state of the blockchain. It is almost identical to [`readContract`](https://viem.sh/docs/contract/readContract.html), but also supports contract write functions.
 *
 * Internally, `simulateContract` uses a [Public Client](https://viem.sh/docs/clients/public.html) to call the [`call` action](https://viem.sh/docs/actions/public/call.html) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData.html).
 */
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
