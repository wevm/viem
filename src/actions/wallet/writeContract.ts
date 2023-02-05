import { Abi } from 'abitype'

import type { WalletClient } from '../../clients'
import type {
  Address,
  Chain,
  ExtractArgsFromAbi,
  ExtractFunctionNameFromAbi,
  GetValue,
} from '../../types'
import { EncodeFunctionDataArgs, encodeFunctionData } from '../../utils'
import {
  sendTransaction,
  SendTransactionArgs,
  SendTransactionResponse,
} from './sendTransaction'

export type WriteContractArgs<
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = any,
> = Omit<SendTransactionArgs<TChain>, 'to' | 'data' | 'value'> & {
  address: Address
  abi: TAbi
  functionName: ExtractFunctionNameFromAbi<TAbi, TFunctionName>
  value?: GetValue<TAbi, TFunctionName, SendTransactionArgs<TChain>['value']>
} & ExtractArgsFromAbi<TAbi, TFunctionName>

export type WriteContractResponse = SendTransactionResponse

export async function writeContract<
  TChain extends Chain,
  TAbi extends Abi = Abi,
  TFunctionName extends string = any,
>(
  client: WalletClient,
  {
    abi,
    address,
    args,
    functionName,
    ...request
  }: WriteContractArgs<TChain, TAbi, TFunctionName>,
): Promise<WriteContractResponse> {
  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as unknown as EncodeFunctionDataArgs<TAbi, TFunctionName>)
  const hash = await sendTransaction(client, {
    data,
    to: address,
    ...request,
  } as unknown as SendTransactionArgs<TChain>)
  return hash
}
