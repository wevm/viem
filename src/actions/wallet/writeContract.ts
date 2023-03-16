import type { Abi } from 'abitype'

import type { WalletClient } from '../../clients'
import type {
  Account,
  Chain,
  ContractConfig,
  GetChain,
  GetValue,
} from '../../types'
import { encodeFunctionData, EncodeFunctionDataParameters } from '../../utils'
import {
  sendTransaction,
  SendTransactionParameters,
  SendTransactionReturnType,
} from './sendTransaction'

export type WriteContractParameters<
  TChain extends Chain | undefined = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TAccount extends Account | undefined = undefined,
  TChainOverride extends Chain | undefined = TChain,
> = Omit<
  SendTransactionParameters<TChain, TAccount, TChainOverride>,
  'chain' | 'to' | 'data' | 'value'
> & {
  value?: GetValue<
    TAbi,
    TFunctionName,
    SendTransactionParameters<TChain>['value']
  >
} & GetChain<TChain, TChainOverride> &
  ContractConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'>

export type WriteContractReturnType = SendTransactionReturnType

export async function writeContract<
  TChain extends Chain | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined = TChain,
>(
  client: WalletClient<any, TChain, TAccount>,
  {
    abi,
    address,
    args,
    functionName,
    ...request
  }: WriteContractParameters<
    TChain,
    TAbi,
    TFunctionName,
    TAccount,
    TChainOverride
  >,
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
  } as unknown as SendTransactionParameters<TChain, TAccount, TChainOverride>)
  return hash
}
