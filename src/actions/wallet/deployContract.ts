import type { Abi, Narrow } from 'abitype'

import type { WalletClient, Transport } from '../../clients'
import type {
  Account,
  Chain,
  ExtractConstructorArgsFromAbi,
  GetChain,
  Hex,
} from '../../types'
import { encodeDeployData } from '../../utils'
import {
  sendTransaction,
  SendTransactionParameters,
  SendTransactionReturnType,
} from '../wallet'

export type DeployContractParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TChain extends Chain | undefined = Chain,
  TAccount extends Account | undefined = undefined,
  TChainOverride extends Chain | undefined = undefined,
> = Omit<
  SendTransactionParameters<TChain, TAccount, TChainOverride>,
  'accessList' | 'chain' | 'to' | 'data' | 'value'
> & {
  abi: Narrow<TAbi>
  bytecode: Hex
} & GetChain<TChain, TChainOverride> &
  ExtractConstructorArgsFromAbi<TAbi>

export type DeployContractReturnType = SendTransactionReturnType

export function deployContract<
  TAbi extends Abi | readonly unknown[],
  TTransport extends Transport,
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined,
>(
  walletClient: WalletClient<TTransport, TChain, TAccount>,
  {
    abi,
    args,
    bytecode,
    ...request
  }: DeployContractParameters<TAbi, TChain, TAccount, TChainOverride>,
): Promise<DeployContractReturnType> {
  const calldata = encodeDeployData({
    abi,
    args,
    bytecode,
  } as unknown as DeployContractParameters<
    TAbi,
    TChain,
    TAccount,
    TChainOverride
  >)
  return sendTransaction(walletClient, {
    ...request,
    data: calldata,
  } as unknown as SendTransactionParameters<TChain, TAccount, TChainOverride>)
}
