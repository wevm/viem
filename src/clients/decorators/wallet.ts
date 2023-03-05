import { Abi } from 'abitype'
import {
  AddChainParameters,
  DeployContractParameters,
  DeployContractReturnType,
  GetAddressesReturnType,
  getChainId,
  GetChainIdReturnType,
  GetPermissionsReturnType,
  RequestAddressesReturnType,
  RequestPermissionsParameters,
  RequestPermissionsReturnType,
  SendTransactionParameters,
  SendTransactionReturnType,
  SignMessageParameters,
  SignMessageReturnType,
  SwitchChainParameters,
  watchAsset,
  WatchAssetParameters,
  WatchAssetReturnType,
  writeContract,
  WriteContractParameters,
  WriteContractReturnType,
} from '../../actions/wallet'
import {
  addChain,
  deployContract,
  getAddresses,
  getPermissions,
  requestAddresses,
  requestPermissions,
  sendTransaction,
  signMessage,
  switchChain,
} from '../../actions/wallet'
import type { Chain } from '../../types'
import type { WalletClient } from '../createWalletClient'

export type WalletActions<TChain extends Chain = Chain> = {
  addChain: (args: AddChainParameters) => Promise<void>
  deployContract: <TAbi extends Abi | readonly unknown[]>(
    args: DeployContractParameters<TChain, TAbi>,
  ) => Promise<DeployContractReturnType>
  getAddresses: () => Promise<GetAddressesReturnType>
  getChainId: () => Promise<GetChainIdReturnType>
  getPermissions: () => Promise<GetPermissionsReturnType>
  requestAddresses: () => Promise<RequestAddressesReturnType>
  requestPermissions: (
    args: RequestPermissionsParameters,
  ) => Promise<RequestPermissionsReturnType>
  sendTransaction: <TChainOverride extends Chain>(
    args: SendTransactionParameters<TChainOverride>,
  ) => Promise<SendTransactionReturnType>
  signMessage: (args: SignMessageParameters) => Promise<SignMessageReturnType>
  switchChain: (args: SwitchChainParameters) => Promise<void>
  watchAsset: (args: WatchAssetParameters) => Promise<WatchAssetReturnType>
  writeContract: <
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends string,
    TChainOverride extends Chain,
  >(
    args: WriteContractParameters<TChainOverride, TAbi, TFunctionName>,
  ) => Promise<WriteContractReturnType>
}

export const walletActions = <
  TChain extends Chain,
  TClient extends WalletClient<any, any>,
>(
  client: TClient,
): WalletActions<TChain> => ({
  addChain: (args) => addChain(client, args),
  deployContract: (args) => deployContract(client, args),
  getAddresses: () => getAddresses(client),
  getChainId: () => getChainId(client),
  getPermissions: () => getPermissions(client),
  requestAddresses: () => requestAddresses(client),
  requestPermissions: (args) => requestPermissions(client, args),
  sendTransaction: (args) => sendTransaction(client, args),
  signMessage: (args) => signMessage(client, args),
  switchChain: (args) => switchChain(client, args),
  watchAsset: (args) => watchAsset(client, args),
  writeContract: (args) => writeContract(client, args),
})
