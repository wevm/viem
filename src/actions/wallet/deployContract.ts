import type { Abi, Narrow } from 'abitype'
import type { WalletClient, Transport } from '../../clients/index.js'
import type {
  Account,
  Chain,
  GetConstructorArgs,
  GetChain,
  Hex,
} from '../../types/index.js'
import { encodeDeployData } from '../../utils/index.js'
import { sendTransaction } from './index.js'
import type {
  SendTransactionParameters,
  SendTransactionReturnType,
} from './index.js'

export type DeployContractParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = undefined,
> = Omit<
  SendTransactionParameters<TChain, TAccount, TChainOverride>,
  'accessList' | 'chain' | 'to' | 'data' | 'value'
> & {
  abi: Narrow<TAbi>
  bytecode: Hex
} & GetChain<TChain, TChainOverride> &
  GetConstructorArgs<TAbi>

export type DeployContractReturnType = SendTransactionReturnType

export function deployContract<
  TAbi extends Abi | readonly unknown[],
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined,
>(
  walletClient: WalletClient<Transport, TChain, TAccount>,
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
