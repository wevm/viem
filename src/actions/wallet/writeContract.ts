import type { Abi } from 'abitype'

import type { WalletClient } from '../../clients/index.js'
import type { Chain, ContractConfig, GetValue } from '../../types/index.js'
import {
  encodeFunctionData,
  EncodeFunctionDataParameters,
} from '../../utils/index.js'
import {
  sendTransaction,
  SendTransactionParameters,
  SendTransactionReturnType,
} from './sendTransaction.js'

export type WriteContractParameters<
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
> = Omit<SendTransactionParameters<TChain>, 'to' | 'data' | 'value'> & {
  value?: GetValue<
    TAbi,
    TFunctionName,
    SendTransactionParameters<TChain>['value']
  >
} & ContractConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'>

export type WriteContractReturnType = SendTransactionReturnType

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
  }: WriteContractParameters<TChain, TAbi, TFunctionName>,
): Promise<WriteContractReturnType> {
  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as unknown as EncodeFunctionDataParameters<TAbi, TFunctionName>)
  const hash = await sendTransaction(client, {
    data,
    to: address,
    ...request,
  } as unknown as SendTransactionParameters<TChain>)
  return hash
}
