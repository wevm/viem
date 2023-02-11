import { Abi, Narrow } from 'abitype'
import { WalletClient } from '../../clients'

import { Chain, ExtractConstructorArgsFromAbi, Hex } from '../../types'
import { encodeDeployData } from '../../utils'
import {
  sendTransaction,
  SendTransactionArgs,
  SendTransactionResponse,
} from '../wallet'

export type DeployContractArgs<
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
> = Omit<
  SendTransactionArgs<TChain>,
  'accessList' | 'to' | 'data' | 'value'
> & {
  abi: Narrow<TAbi>
  bytecode: Hex
} & ExtractConstructorArgsFromAbi<TAbi>

export type DeployContractResponse = SendTransactionResponse

export function deployContract<TChain extends Chain, TAbi extends Abi>(
  walletClient: WalletClient,
  { abi, args, bytecode, ...request }: DeployContractArgs<TChain, TAbi>,
): Promise<DeployContractResponse> {
  const calldata = encodeDeployData({
    abi,
    args,
    bytecode,
  } as unknown as DeployContractArgs<TChain, TAbi>)
  return sendTransaction(walletClient, {
    ...request,
    data: calldata,
  } as unknown as SendTransactionArgs<TChain>)
}
