import { Abi } from 'abitype'
import { Chain } from '../../chains'
import { WalletClient } from '../../clients'

import { ExtractConstructorArgsFromAbi, Hex } from '../../types'
import { encodeDeployData } from '../../utils'
import {
  sendTransaction,
  SendTransactionArgs,
  SendTransactionResponse,
} from '../wallet'

export type DeployContractArgs<
  TChain extends Chain = Chain,
  TAbi extends Abi = Abi,
> = Omit<
  SendTransactionArgs<TChain>,
  'accessList' | 'to' | 'data' | 'value'
> & {
  abi: TAbi
  bytecode: Hex
} & ExtractConstructorArgsFromAbi<TAbi>

export type DeployContractResponse = SendTransactionResponse

export function deployContract<TChain extends Chain, TAbi extends Abi = Abi>(
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
