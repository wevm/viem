import type { Abi } from 'abitype'

import type { PublicClientArg } from '../../clients'
import type { BaseError } from '../../errors'
import type { ContractConfig, ExtractResultFromAbi } from '../../types'
import {
  decodeFunctionResult,
  DecodeFunctionResultParameters,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  getContractError,
} from '../../utils'
import { call, CallParameters } from './call'

export type ReadContractParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = Pick<CallParameters, 'blockNumber' | 'blockTag'> &
  ContractConfig<TAbi, TFunctionName, 'view' | 'pure'>

export type ReadContractReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = ExtractResultFromAbi<TAbi, TFunctionName>

/**
 * Calls a read-only function on a contract, and returns the response.
 *
 * A "read-only" function (constant function) on a Solidity contract is denoted by a `view` or `pure` keyword. They can only read the state of the contract, and cannot make any changes to it. Since read-only methods do not change the state of the contract, they do not require any gas to be executed, and can be called by any user without the need to pay for gas.
 *
 * Internally, `readContract` uses a [Public Client](https://viem.sh/docs/clients/public.html) to call the [`call` action](https://viem.sh/docs/actions/public/call.html) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData.html).
 */
export async function readContract<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
>(
  client: PublicClientArg,
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
