import { Abi } from 'abitype'

import type { WalletClient } from '../../clients'
import type { Chain, ContractConfig, GetValue } from '../../types'
import { EncodeFunctionDataArgs, encodeFunctionData } from '../../utils'
import {
  sendTransaction,
  SendTransactionArgs,
  SendTransactionResponse,
} from './sendTransaction'

export type WriteContractArgs<
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = Omit<SendTransactionArgs<TChain>, 'to' | 'data' | 'value'> & {
  value?: GetValue<TAbi, TFunctionName, SendTransactionArgs<TChain>['value']>
} & ContractConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'>

export type WriteContractResponse = SendTransactionResponse

export async function writeContract<
  TChain extends Chain,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
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
