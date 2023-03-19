import type { Abi, Narrow } from 'abitype'

import type { Account } from '../../accounts'
import type { WalletClientArg, Transport } from '../../clients'
import type {
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
  TChain extends Chain | undefined = Chain | undefined,
  TAbi extends Abi | readonly unknown[] = Abi,
  TAccount extends Account | undefined = undefined,
  TChainOverride extends Chain | undefined = TChain,
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
  TChain extends Chain | undefined,
  TAbi extends Abi | readonly unknown[],
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined = TChain,
>(
  walletClient: WalletClientArg<Transport, TChain, TAccount>,
  {
    abi,
    args,
    bytecode,
    ...request
  }: DeployContractParameters<TChain, TAbi, TAccount, TChainOverride>,
): Promise<DeployContractReturnType> {
  const calldata = encodeDeployData({
    abi,
    args,
    bytecode,
  } as unknown as DeployContractParameters<
    TChain,
    TAbi,
    TAccount,
    TChainOverride
  >)
  return sendTransaction(walletClient, {
    ...request,
    data: calldata,
  } as unknown as SendTransactionParameters<TChain, TAccount, TChainOverride>)
}
