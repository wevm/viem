import type { Abi } from 'abitype'

import type { PublicClient, Transport } from '../../clients/index.js'
import type { BaseError } from '../../errors/index.js'
import type {
  Chain,
  ContractFunctionConfig,
  ContractFunctionResult,
} from '../../types/index.js'
import {
  decodeFunctionResult,
  encodeFunctionData,
  getContractError,
} from '../../utils/index.js'
import type {
  DecodeFunctionResultParameters,
  EncodeFunctionDataParameters,
} from '../../utils/index.js'
import { call } from './call.js'
import type { CallParameters } from './call.js'

export type ReadContractParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = Pick<CallParameters, 'blockNumber' | 'blockTag'> &
  ContractFunctionConfig<TAbi, TFunctionName, 'view' | 'pure'>

export type ReadContractReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = ContractFunctionResult<TAbi, TFunctionName>

export async function readContract<
  TChain extends Chain | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
>(
  client: PublicClient<Transport, TChain>,
  {
    abi,
    address,
    args,
    functionName,
    ...callRequest
  }: ReadContractParameters<TAbi, TFunctionName>,
): Promise<ReadContractReturnType<TAbi, TFunctionName>> {
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
    } as unknown as CallParameters)
    return decodeFunctionResult({
      abi,
      args,
      functionName,
      data: data || '0x',
    } as DecodeFunctionResultParameters<TAbi, TFunctionName>)
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
