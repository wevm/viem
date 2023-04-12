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
  /**
   * Adds an EVM chain to the wallet.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/addChain.html
   * - JSON-RPC Methods: [`eth_addEthereumChain`](https://eips.ethereum.org/EIPS/eip-3085)
   *
   * @param parameters - {@link AddChainParameters}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { optimism } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   transport: custom(window.ethereum),
   * })
   * await client.addChain({ chain: optimism })
   */
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
   *   account: privateKeyToAccount('0x…'),
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
  /**
   * Returns a list of account addresses owned by the wallet or client.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/getAddresses.html
   * - JSON-RPC Methods: [`eth_accounts`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_accounts)
   *
   * @returns List of account addresses owned by the wallet or client. {@link GetAddressesReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const accounts = await client.getAddresses()
   */
  getAddresses: () => Promise<GetAddressesReturnType>
  /**
   * Returns the chain ID associated with the current network.
   *
   * - Docs: https://viem.sh/docs/actions/public/getChainId.html
   * - JSON-RPC Methods: [`eth_chainId`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_chainid)
   *
   * @returns The current chain ID. {@link GetChainIdReturnType}
   *
   * @example
   * import { createWalletClient, http } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const chainId = await client.getChainId()
   * // 1
   */
  getChainId: () => Promise<GetChainIdReturnType>
  /**
   * Gets the wallets current permissions.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/getPermissions.html
   * - JSON-RPC Methods: [`wallet_getPermissions`](https://eips.ethereum.org/EIPS/eip-2255)
   *
   * @returns The wallet permissions. {@link GetPermissionsReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const permissions = await client.getPermissions()
   */
  getPermissions: () => Promise<GetPermissionsReturnType>
  /**
   * Requests a list of accounts managed by a wallet.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/requestAddresses.html
   * - JSON-RPC Methods: [`eth_requestAccounts`](https://eips.ethereum.org/EIPS/eip-1102)
   *
   * Sends a request to the wallet, asking for permission to access the user's accounts. After the user accepts the request, it will return a list of accounts (addresses).
   *
   * This API can be useful for dapps that need to access the user's accounts in order to execute transactions or interact with smart contracts.
   *
   * @returns List of accounts managed by a wallet {@link RequestAddressesReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const accounts = await client.requestAddresses()
   */
  requestAddresses: () => Promise<RequestAddressesReturnType>
  /**
   * Requests permissions for a wallet.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/requestPermissions.html
   * - JSON-RPC Methods: [`wallet_requestPermissions`](https://eips.ethereum.org/EIPS/eip-2255)
   *
   * @param parameters - {@link RequestPermissionsParameters}
   * @returns The wallet permissions. {@link RequestPermissionsReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const permissions = await client.requestPermissions({
   *   eth_accounts: {}
   * })
   */
  requestPermissions: (
    args: RequestPermissionsParameters,
  ) => Promise<RequestPermissionsReturnType>
  /**
   * Creates, signs, and sends a new transaction to the network.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/sendTransaction.html
   * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions/sending-transactions
   * - JSON-RPC Methods:
   *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
   *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
   *
   * @param parameters - {@link SendTransactionParameters}
   * @returns The [Transaction](https://viem.sh/docs/glossary/terms.html#transaction) hash. {@link SendTransactionReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { sendTransaction } from 'viem/wallet'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const hash = await client.sendTransaction({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: 1000000000000000000n
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { sendTransaction } from 'viem/wallet'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const hash = await client.sendTransaction({
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: 1000000000000000000n
   * })
   */
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
