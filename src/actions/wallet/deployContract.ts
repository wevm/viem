import { Abi, Narrow } from 'abitype'
import { WalletClient } from '../../clients'

import { Chain, ExtractConstructorArgsFromAbi, Hex } from '../../types'
import { encodeDeployData } from '../../utils'
import {
  sendTransaction,
  SendTransactionParameters,
  SendTransactionReturnType,
} from '../wallet'

export type DeployContractParameters<
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
> = Omit<
  SendTransactionParameters<TChain>,
  'accessList' | 'to' | 'data' | 'value'
> & {
  abi: Narrow<TAbi>
  bytecode: Hex
} & ExtractConstructorArgsFromAbi<TAbi>

export type DeployContractReturnType = SendTransactionReturnType

export function deployContract<
  TChain extends Chain,
  TAbi extends Abi | readonly unknown[],
>(
  walletClient: WalletClient,
  { abi, args, bytecode, ...request }: DeployContractParameters<TChain, TAbi>,
): Promise<DeployContractReturnType> {
  const calldata = encodeDeployData({
    abi,
    args,
    bytecode,
  } as unknown as DeployContractParameters<TChain, TAbi>)
  return sendTransaction(walletClient, {
    ...request,
    data: calldata,
  } as unknown as SendTransactionParameters<TChain>)
}
