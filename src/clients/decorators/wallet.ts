import type { Abi, TypedData } from 'abitype'
import type {
  AddChainParameters,
  DeployContractParameters,
  DeployContractReturnType,
  GetAddressesReturnType,
  GetChainIdReturnType,
  GetPermissionsReturnType,
  RequestAddressesReturnType,
  RequestPermissionsParameters,
  RequestPermissionsReturnType,
  SendTransactionParameters,
  SendTransactionReturnType,
  SignMessageParameters,
  SignMessageReturnType,
  SignTypedDataParameters,
  SignTypedDataReturnType,
  SwitchChainParameters,
  WatchAssetParameters,
  WatchAssetReturnType,
  WriteContractParameters,
  WriteContractReturnType,
} from '../../actions/wallet/index.js'
import {
  addChain,
  deployContract,
  getAddresses,
  getChainId,
  getPermissions,
  requestAddresses,
  requestPermissions,
  sendTransaction,
  signMessage,
  signTypedData,
  switchChain,
  watchAsset,
  writeContract,
} from '../../actions/wallet/index.js'
import type { Account, Chain } from '../../types/index.js'
import type { WalletClient } from '../createWalletClient.js'
import type { Transport } from '../transports/index.js'

export type WalletActions<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
> = {
  addChain: (args: AddChainParameters) => Promise<void>
  /**
   * Deploys a contract to the network, given bytecode and constructor arguments.
   *
   * - Docs: https://viem.sh/docs/contract/deployContract.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/contracts/deploying-contracts
   *
   * @param parameters - {@link DeployContractParameters}
   * @returns The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link DeployContractReturnType}
   *
   * @example
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   account = privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const hash = await client.deployContract({
   *   abi: [],
   *   account: '0x…,
   *   bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
   * })
   */
  deployContract: <
    TAbi extends Abi | readonly unknown[],
    TChainOverride extends Chain | undefined,
  >(
    args: DeployContractParameters<TAbi, TChain, TAccount, TChainOverride>,
  ) => Promise<DeployContractReturnType>
  getAddresses: () => Promise<GetAddressesReturnType>
  getChainId: () => Promise<GetChainIdReturnType>
  getPermissions: () => Promise<GetPermissionsReturnType>
  requestAddresses: () => Promise<RequestAddressesReturnType>
  requestPermissions: (
    args: RequestPermissionsParameters,
  ) => Promise<RequestPermissionsReturnType>
  sendTransaction: <TChainOverride extends Chain | undefined>(
    args: SendTransactionParameters<TChain, TAccount, TChainOverride>,
  ) => Promise<SendTransactionReturnType>
  signMessage: (
    args: SignMessageParameters<TAccount>,
  ) => Promise<SignMessageReturnType>
  signTypedData: <
    TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string,
  >(
    args: SignTypedDataParameters<TTypedData, TPrimaryType, TAccount>,
  ) => Promise<SignTypedDataReturnType>
  switchChain: (args: SwitchChainParameters) => Promise<void>
  watchAsset: (args: WatchAssetParameters) => Promise<WatchAssetReturnType>
  writeContract: <
    TAbi extends Abi | readonly unknown[],
    TFunctionName extends string,
    TChainOverride extends Chain | undefined,
  >(
    args: WriteContractParameters<
      TAbi,
      TFunctionName,
      TChain,
      TAccount,
      TChainOverride
    >,
  ) => Promise<WriteContractReturnType>
}

export const walletActions: <
  TTransport extends Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(
  client: WalletClient<TTransport, TChain, TAccount>,
) => WalletActions<TChain, TAccount> = <
  TTransport extends Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(
  client: WalletClient<TTransport, TChain, TAccount>,
): WalletActions<TChain, TAccount> => ({
  addChain: (args) => addChain(client, args),
  deployContract: (args) => deployContract(client, args),
  getAddresses: () => getAddresses(client),
  getChainId: () => getChainId(client),
  getPermissions: () => getPermissions(client),
  requestAddresses: () => requestAddresses(client),
  requestPermissions: (args) => requestPermissions(client, args),
  sendTransaction: (args) => sendTransaction(client, args),
  signMessage: (args) => signMessage(client, args),
  signTypedData: (args) => signTypedData(client, args),
  switchChain: (args) => switchChain(client, args),
  watchAsset: (args) => watchAsset(client, args),
  writeContract: (args) => writeContract(client, args),
})
