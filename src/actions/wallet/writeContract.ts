import type { Abi } from 'abitype'

import type { Transport, WalletClient } from '../../clients/index.js'
import type {
  Account,
  Chain,
  ContractFunctionConfig,
  GetChain,
  GetValue,
} from '../../types/index.js'
import { encodeFunctionData } from '../../utils/index.js'
import type { EncodeFunctionDataParameters } from '../../utils/index.js'
import { sendTransaction } from './sendTransaction.js'
import type {
  SendTransactionParameters,
  SendTransactionReturnType,
} from './sendTransaction.js'

export type WriteContractParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TChain extends Chain | undefined = Chain,
  TAccount extends Account | undefined = undefined,
  TChainOverride extends Chain | undefined = undefined,
> = ContractFunctionConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'> &
  Omit<
    SendTransactionParameters<TChain, TAccount, TChainOverride>,
    'chain' | 'to' | 'data' | 'value'
  > &
  GetChain<TChain, TChainOverride> &
  GetValue<TAbi, TFunctionName, SendTransactionParameters<TChain>['value']>

export type WriteContractReturnType = SendTransactionReturnType

export async function writeContract<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChainOverride extends Chain | undefined = undefined,
>(
  client: WalletClient<Transport, TChain, TAccount>,
  {
    abi,
    address,
    args,
    functionName,
    ...request
  }: WriteContractParameters<
    TAbi,
    TFunctionName,
    TChain,
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
