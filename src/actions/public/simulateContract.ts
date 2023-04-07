import type { Abi } from 'abitype'

import type { PublicClient, Transport } from '../../clients/index.js'
import type { BaseError } from '../../errors/index.js'
import type {
  Chain,
  ContractFunctionConfig,
  ContractFunctionResult,
  GetValue,
} from '../../types/index.js'
import {
  decodeFunctionResult,
  encodeFunctionData,
  getContractError,
  parseAccount,
} from '../../utils/index.js'
import type {
  DecodeFunctionResultParameters,
  EncodeFunctionDataParameters,
} from '../../utils/index.js'
import type { WriteContractParameters } from '../wallet/index.js'
import { call } from './call.js'
import type { CallParameters } from './call.js'

export type SimulateContractParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = any,
  TChain extends Chain | undefined = Chain | undefined,
  TChainOverride extends Chain | undefined = undefined,
> = {
  chain?: TChainOverride
} & ContractFunctionConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'> &
  Omit<
    CallParameters<TChainOverride extends Chain ? TChainOverride : TChain>,
    'to' | 'data' | 'value'
  > &
  GetValue<TAbi, TFunctionName, CallParameters<TChain>['value']>

export type SimulateContractReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TChain extends Chain | undefined = Chain | undefined,
  TChainOverride extends Chain | undefined = undefined,
> = {
  result: ContractFunctionResult<TAbi, TFunctionName>
  request: Omit<
    WriteContractParameters<
      TAbi,
      TFunctionName,
      TChain,
      undefined,
      TChainOverride
    >,
    'chain'
  > & {
    chain: TChainOverride
  } & ContractFunctionConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'>
}

export async function simulateContract<
  TChain extends Chain | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChainOverride extends Chain | undefined,
>(
  client: PublicClient<Transport, TChain>,
  {
    abi,
    address,
    args,
    functionName,
    ...callRequest
  }: SimulateContractParameters<TAbi, TFunctionName, TChain, TChainOverride>,
): Promise<
  SimulateContractReturnType<TAbi, TFunctionName, TChain, TChainOverride>
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
      TAbi,
      TFunctionName,
      TChain,
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
