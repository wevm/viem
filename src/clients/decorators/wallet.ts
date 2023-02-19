import { Abi } from 'abitype'
import {
  DeployContractArgs,
  DeployContractResponse,
  GetPermissionsResponse,
  RequestPermissionsArgs,
  RequestPermissionsResponse,
  SendTransactionArgs,
  SendTransactionResponse,
  SignMessageArgs,
  SignMessageResponse,
  SwitchChainArgs,
  watchAsset,
  WatchAssetArgs,
  WatchAssetResponse,
  writeContract,
  WriteContractArgs,
  WriteContractResponse,
} from '../../actions/wallet'
import {
  addChain,
  deployContract,
  getAccounts,
  getPermissions,
  requestAccounts,
  requestPermissions,
  sendTransaction,
  signMessage,
  switchChain,
} from '../../actions/wallet'
import type { Address, Chain } from '../../types'
import type { WalletClient } from '../createWalletClient'

export type WalletActions<TChain extends Chain = Chain> = {
  addChain: (args: Chain) => Promise<void>
  deployContract: <
    TChainOverride extends Chain = TChain,
    TAbi extends Abi | readonly unknown[] = Abi,
  >(
    args: DeployContractArgs<TChainOverride, TAbi>,
  ) => Promise<DeployContractResponse>
  getAccounts: () => Promise<Address[]>
  getPermissions: () => Promise<GetPermissionsResponse>
  requestAccounts: () => Promise<Address[]>
  requestPermissions: (
    args: RequestPermissionsArgs,
  ) => Promise<RequestPermissionsResponse>
  sendTransaction: <TChainOverride extends Chain = TChain>(
    args: SendTransactionArgs<TChainOverride>,
  ) => Promise<SendTransactionResponse>
  signMessage: (args: SignMessageArgs) => Promise<SignMessageResponse>
  switchChain: (args: SwitchChainArgs) => Promise<void>
  watchAsset: (args: WatchAssetArgs) => Promise<WatchAssetResponse>
  writeContract: <
    TChainOverride extends Chain = TChain,
    TAbi extends Abi | readonly unknown[] = Abi,
    TFunctionName extends string = string,
  >(
    args: WriteContractArgs<TChainOverride, TAbi, TFunctionName>,
  ) => Promise<WriteContractResponse>
}

export const walletActions = <
  TChain extends Chain,
  TClient extends WalletClient<any, any>,
>(
  client: TClient,
): WalletActions<TChain> => ({
  addChain: (args) => addChain(client, args),
  deployContract: (args) => deployContract(client, args),
  getAccounts: () => getAccounts(client),
  getPermissions: () => getPermissions(client),
  requestAccounts: () => requestAccounts(client),
  requestPermissions: (args) => requestPermissions(client, args),
  sendTransaction: (args) => sendTransaction(client, args),
  signMessage: (args) => signMessage(client, args),
  switchChain: (args) => switchChain(client, args),
  watchAsset: (args) => watchAsset(client, args),
  writeContract: (args) => writeContract(client, args),
})
