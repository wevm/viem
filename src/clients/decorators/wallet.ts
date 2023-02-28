import { Abi } from 'abitype'
import {
  AddChainArgs,
  DeployContractArgs,
  DeployContractResponse,
  GetAddressesResponse,
  getChainId,
  GetChainIdResponse,
  GetPermissionsResponse,
  RequestAddressesResponse,
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
  addChain: (args: AddChainArgs) => Promise<void>
  deployContract: <TAbi extends Abi | readonly unknown[]>(
    args: DeployContractArgs<TChain, TAbi>,
  ) => Promise<DeployContractResponse>
  getAddresses: () => Promise<GetAddressesResponse>
  getChainId: () => Promise<GetChainIdResponse>
  getPermissions: () => Promise<GetPermissionsResponse>
  requestAddresses: () => Promise<RequestAddressesResponse>
  requestPermissions: (
    args: RequestPermissionsArgs,
  ) => Promise<RequestPermissionsResponse>
  sendTransaction: <TChainOverride extends Chain>(
    args: SendTransactionArgs<TChainOverride>,
  ) => Promise<SendTransactionResponse>
  signMessage: (args: SignMessageArgs) => Promise<SignMessageResponse>
  switchChain: (args: SwitchChainArgs) => Promise<void>
  watchAsset: (args: WatchAssetArgs) => Promise<WatchAssetResponse>
  writeContract: <
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends string,
    TChainOverride extends Chain,
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
