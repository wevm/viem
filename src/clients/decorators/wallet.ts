import type { Abi, Address, TypedData } from 'abitype'

import type { Account } from '../../accounts/types.js'
import {
  type FillTransactionParameters,
  type FillTransactionReturnType,
  fillTransaction,
} from '../../actions/public/fillTransaction.js'
import {
  type GetChainIdReturnType,
  getChainId,
} from '../../actions/public/getChainId.js'
import {
  type AddChainParameters,
  addChain,
} from '../../actions/wallet/addChain.js'
import {
  type DeployContractParameters,
  type DeployContractReturnType,
  deployContract,
} from '../../actions/wallet/deployContract.js'
import {
  type GetAddressesReturnType,
  getAddresses,
} from '../../actions/wallet/getAddresses.js'
import {
  type GetCallsStatusParameters,
  type GetCallsStatusReturnType,
  getCallsStatus,
} from '../../actions/wallet/getCallsStatus.js'
import {
  type GetCapabilitiesParameters,
  type GetCapabilitiesReturnType,
  getCapabilities,
} from '../../actions/wallet/getCapabilities.js'
import {
  type GetPermissionsReturnType,
  getPermissions,
} from '../../actions/wallet/getPermissions.js'
import {
  type PrepareAuthorizationParameters,
  type PrepareAuthorizationReturnType,
  prepareAuthorization,
} from '../../actions/wallet/prepareAuthorization.js'
import {
  type PrepareTransactionRequestParameters,
  type PrepareTransactionRequestRequest,
  type PrepareTransactionRequestReturnType,
  prepareTransactionRequest,
} from '../../actions/wallet/prepareTransactionRequest.js'
import {
  type RequestAddressesReturnType,
  requestAddresses,
} from '../../actions/wallet/requestAddresses.js'
import {
  type RequestPermissionsParameters,
  type RequestPermissionsReturnType,
  requestPermissions,
} from '../../actions/wallet/requestPermissions.js'
import {
  type SendCallsParameters,
  type SendCallsReturnType,
  sendCalls,
} from '../../actions/wallet/sendCalls.js'
import {
  type SendCallsSyncParameters,
  type SendCallsSyncReturnType,
  sendCallsSync,
} from '../../actions/wallet/sendCallsSync.js'
import {
  type SendRawTransactionParameters,
  type SendRawTransactionReturnType,
  sendRawTransaction,
} from '../../actions/wallet/sendRawTransaction.js'
import {
  type SendRawTransactionSyncParameters,
  type SendRawTransactionSyncReturnType,
  sendRawTransactionSync,
} from '../../actions/wallet/sendRawTransactionSync.js'
import {
  type SendTransactionParameters,
  type SendTransactionRequest,
  type SendTransactionReturnType,
  sendTransaction,
} from '../../actions/wallet/sendTransaction.js'
import {
  type SendTransactionSyncParameters,
  type SendTransactionSyncRequest,
  type SendTransactionSyncReturnType,
  sendTransactionSync,
} from '../../actions/wallet/sendTransactionSync.js'
import {
  type ShowCallsStatusParameters,
  type ShowCallsStatusReturnType,
  showCallsStatus,
} from '../../actions/wallet/showCallsStatus.js'
import {
  type SignAuthorizationParameters,
  type SignAuthorizationReturnType,
  signAuthorization,
} from '../../actions/wallet/signAuthorization.js'
import {
  type SignMessageParameters,
  type SignMessageReturnType,
  signMessage,
} from '../../actions/wallet/signMessage.js'
import {
  type SignTransactionParameters,
  type SignTransactionRequest,
  type SignTransactionReturnType,
  signTransaction,
} from '../../actions/wallet/signTransaction.js'
import {
  type SignTypedDataParameters,
  type SignTypedDataReturnType,
  signTypedData,
} from '../../actions/wallet/signTypedData.js'
import {
  type SwitchChainParameters,
  switchChain,
} from '../../actions/wallet/switchChain.js'
import {
  type WaitForCallsStatusParameters,
  type WaitForCallsStatusReturnType,
  waitForCallsStatus,
} from '../../actions/wallet/waitForCallsStatus.js'
import {
  type WatchAssetParameters,
  type WatchAssetReturnType,
  watchAsset,
} from '../../actions/wallet/watchAsset.js'
import {
  type WriteContractParameters,
  type WriteContractReturnType,
  writeContract,
} from '../../actions/wallet/writeContract.js'
import {
  type WriteContractSyncParameters,
  type WriteContractSyncReturnType,
  writeContractSync,
} from '../../actions/wallet/writeContractSync.js'
import type { Chain } from '../../types/chain.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from '../../types/contract.js'
import type { Client } from '../createClient.js'
import type { Transport } from '../transports/createTransport.js'

export type WalletActions<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Adds an EVM chain to the wallet.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/addChain
   * - JSON-RPC Methods: [`eth_addEthereumChain`](https://eips.ethereum.org/EIPS/eip-3085)
   *
   * @param args - {@link AddChainParameters}
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
   * - Docs: https://viem.sh/docs/contract/deployContract
   * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_deploying-contracts
   *
   * @param args - {@link DeployContractParameters}
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
    const abi extends Abi | readonly unknown[],
    chainOverride extends Chain | undefined,
  >(
    args: DeployContractParameters<abi, chain, account, chainOverride>,
  ) => Promise<DeployContractReturnType>
  /**
   * Fills a transaction request with the necessary fields to be signed over.
   *
   * - Docs: https://viem.sh/docs/actions/public/fillTransaction
   *
   * @param client - Client to use
   * @param parameters - {@link FillTransactionParameters}
   * @returns The filled transaction. {@link FillTransactionReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const result = await client.fillTransaction({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: parseEther('1'),
   * })
   */
  fillTransaction: <
    chainOverride extends Chain | undefined = undefined,
    accountOverride extends Account | Address | undefined = undefined,
  >(
    args: FillTransactionParameters<
      chain,
      account,
      chainOverride,
      accountOverride
    >,
  ) => Promise<FillTransactionReturnType<chain, chainOverride>>
  /**
   * Returns a list of account addresses owned by the wallet or client.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/getAddresses
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
   * Returns the status of a call batch that was sent via `sendCalls`.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/getCallsStatus
   * - JSON-RPC Methods: [`wallet_getCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
   *
   * @param client - Client to use
   * @returns Status of the calls. {@link GetCallsStatusReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   *
   * const { receipts, status } = await client.getCallsStatus({ id: '0xdeadbeef' })
   */
  getCallsStatus: (
    parameters: GetCallsStatusParameters,
  ) => Promise<GetCallsStatusReturnType>
  /**
   * Extract capabilities that a connected wallet supports (e.g. paymasters, session keys, etc).
   *
   * - Docs: https://viem.sh/docs/actions/wallet/getCapabilities
   * - JSON-RPC Methods: [`wallet_getCapabilities`](https://eips.ethereum.org/EIPS/eip-5792)
   *
   * @param client - Client to use
   * @returns The wallet's capabilities. {@link GetCapabilitiesReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   *
   * const capabilities = await client.getCapabilities({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   */
  getCapabilities: <chainId extends number | undefined>(
    parameters?: GetCapabilitiesParameters<chainId>,
  ) => Promise<GetCapabilitiesReturnType<chainId>>
  /**
   * Returns the chain ID associated with the current network.
   *
   * - Docs: https://viem.sh/docs/actions/public/getChainId
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
   * - Docs: https://viem.sh/docs/actions/wallet/getPermissions
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
   * Prepares an [EIP-7702 Authorization](https://eips.ethereum.org/EIPS/eip-7702) object for signing.
   * This Action will fill the required fields of the Authorization object if they are not provided (e.g. `nonce` and `chainId`).
   *
   * With the prepared Authorization object, you can use [`signAuthorization`](https://viem.sh/docs/eip7702/signAuthorization) to sign over the Authorization object.
   *
   * @param client - Client to use
   * @param parameters - {@link PrepareAuthorizationParameters}
   * @returns The prepared Authorization object. {@link PrepareAuthorizationReturnType}
   *
   * @example
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   *
   * const authorization = await client.prepareAuthorization({
   *   account: privateKeyToAccount('0x..'),
   *   contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * })
   *
   * const authorization = await client.prepareAuthorization({
   *   contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   */
  prepareAuthorization: (
    parameters: PrepareAuthorizationParameters<account>,
  ) => Promise<PrepareAuthorizationReturnType>
  /**
   * Prepares a transaction request for signing.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/prepareTransactionRequest
   *
   * @param args - {@link PrepareTransactionRequestParameters}
   * @returns The transaction request. {@link PrepareTransactionRequestReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const request = await client.prepareTransactionRequest({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x0000000000000000000000000000000000000000',
   *   value: 1n,
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const request = await client.prepareTransactionRequest({
   *   to: '0x0000000000000000000000000000000000000000',
   *   value: 1n,
   * })
   */
  prepareTransactionRequest: <
    const request extends PrepareTransactionRequestRequest<
      chain,
      chainOverride
    >,
    chainOverride extends Chain | undefined = undefined,
    accountOverride extends Account | Address | undefined = undefined,
  >(
    args: PrepareTransactionRequestParameters<
      chain,
      account,
      chainOverride,
      accountOverride,
      request
    >,
  ) => Promise<
    PrepareTransactionRequestReturnType<
      chain,
      account,
      chainOverride,
      accountOverride,
      request
    >
  >
  /**
   * Requests a list of accounts managed by a wallet.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/requestAddresses
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
   * - Docs: https://viem.sh/docs/actions/wallet/requestPermissions
   * - JSON-RPC Methods: [`wallet_requestPermissions`](https://eips.ethereum.org/EIPS/eip-2255)
   *
   * @param args - {@link RequestPermissionsParameters}
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
   * Requests the connected wallet to send a batch of calls.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/sendCalls
   * - JSON-RPC Methods: [`wallet_sendCalls`](https://eips.ethereum.org/EIPS/eip-5792)
   *
   * @param client - Client to use
   * @returns Transaction identifier. {@link SendCallsReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   *
   * const id = await client.sendCalls({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   calls: [
   *     {
   *       data: '0xdeadbeef',
   *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *     },
   *     {
   *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *       value: 69420n,
   *     },
   *   ],
   * })
   */
  sendCalls: <
    const calls extends readonly unknown[],
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: SendCallsParameters<chain, account, chainOverride, calls>,
  ) => Promise<SendCallsReturnType>
  /**
   * Requests the connected wallet to send a batch of calls, and waits for the calls to be included in a block.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/sendCallsSync
   * - JSON-RPC Methods: [`wallet_sendCalls`](https://eips.ethereum.org/EIPS/eip-5792)
   *
   * @param client - Client to use
   * @returns Calls status. {@link SendCallsSyncReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   *
   * const status = await client.sendCallsSync({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   calls: [
   *     {
   *       data: '0xdeadbeef',
   *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *     },
   *     {
   *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *       value: 69420n,
   *     },
   *   ],
   * })
   */
  sendCallsSync: <
    const calls extends readonly unknown[],
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: SendCallsSyncParameters<chain, account, chainOverride, calls>,
  ) => Promise<SendCallsSyncReturnType>
  /**
   * Sends a **signed** transaction to the network
   *
   * - Docs: https://viem.sh/docs/actions/wallet/sendRawTransaction
   * - JSON-RPC Method: [`eth_sendRawTransaction`](https://ethereum.github.io/execution-apis/api-documentation/)
   *
   * @param client - Client to use
   * @param parameters - {@link SendRawTransactionParameters}
   * @returns The transaction hash. {@link SendRawTransactionReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { sendRawTransaction } from 'viem/wallet'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   *
   * const hash = await client.sendRawTransaction({
   *   serializedTransaction: '0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33'
   * })
   */
  sendRawTransaction: (
    args: SendRawTransactionParameters,
  ) => Promise<SendRawTransactionReturnType>
  /**
   * Sends a **signed** transaction to the network synchronously,
   * and waits for the transaction to be included in a block.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/sendRawTransactionSync
   * - JSON-RPC Method: [`eth_sendRawTransactionSync`](https://eips.ethereum.org/EIPS/eip-7966)
   *
   * @param client - Client to use
   * @param parameters - {@link SendRawTransactionSyncParameters}
   * @returns The transaction receipt. {@link SendRawTransactionSyncReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { sendRawTransactionSync } from 'viem/wallet'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   *
   * const receipt = await client.sendRawTransactionSync({
   *   serializedTransaction: '0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33'
   * })
   */
  sendRawTransactionSync: (
    args: SendRawTransactionSyncParameters,
  ) => Promise<SendRawTransactionSyncReturnType<chain>>
  /**
   * Creates, signs, and sends a new transaction to the network.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/sendTransaction
   * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_sending-transactions
   * - JSON-RPC Methods:
   *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
   *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
   *
   * @param args - {@link SendTransactionParameters}
   * @returns The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link SendTransactionReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const hash = await client.sendTransaction({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: 1000000000000000000n,
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const hash = await client.sendTransaction({
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: 1000000000000000000n,
   * })
   */
  sendTransaction: <
    const request extends SendTransactionRequest<chain, chainOverride>,
    chainOverride extends Chain | undefined = undefined,
  >(
    args: SendTransactionParameters<chain, account, chainOverride, request>,
  ) => Promise<SendTransactionReturnType>
  /**
   * Creates, signs, and sends a new transaction to the network synchronously.
   * Returns the transaction receipt.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/sendTransactionSync
   * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_sending-transactions
   * - JSON-RPC Methods:
   *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
   *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
   *
   * @param args - {@link SendTransactionParameters}
   * @returns The transaction receipt. {@link SendTransactionReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const receipt = await client.sendTransactionSync({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: 1000000000000000000n,
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const receipt = await client.sendTransactionSync({
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: 1000000000000000000n,
   * })
   */
  sendTransactionSync: <
    const request extends SendTransactionSyncRequest<chain, chainOverride>,
    chainOverride extends Chain | undefined = undefined,
  >(
    args: SendTransactionSyncParameters<chain, account, chainOverride, request>,
  ) => Promise<SendTransactionSyncReturnType<chain>>
  /**
   * Requests for the wallet to show information about a call batch
   * that was sent via `sendCalls`.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/showCallsStatus
   * - JSON-RPC Methods: [`wallet_showCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
   *
   * @param client - Client to use
   * @returns Displays status of the calls in wallet. {@link ShowCallsStatusReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   *
   * await client.showCallsStatus({ id: '0xdeadbeef' })
   */
  showCallsStatus: (
    parameters: ShowCallsStatusParameters,
  ) => Promise<ShowCallsStatusReturnType>
  /**
   * Signs an [EIP-7702 Authorization](https://eips.ethereum.org/EIPS/eip-7702) object.
   *
   * With the calculated signature, you can:
   * - use [`verifyAuthorization`](https://viem.sh/docs/eip7702/verifyAuthorization) to verify the signed Authorization object,
   * - use [`recoverAuthorizationAddress`](https://viem.sh/docs/eip7702/recoverAuthorizationAddress) to recover the signing address from the signed Authorization object.
   *
   * @param client - Client to use
   * @param parameters - {@link SignAuthorizationParameters}
   * @returns The signed Authorization object. {@link SignAuthorizationReturnType}
   *
   * @example
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: http(),
   * })
   *
   * const signature = await client.signAuthorization({
   *   account: privateKeyToAccount('0x..'),
   *   contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * })
   *
   * const signature = await client.signAuthorization({
   *   contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   */
  signAuthorization: (
    parameters: SignAuthorizationParameters<account>,
  ) => Promise<SignAuthorizationReturnType>
  /**
   * Calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/signMessage
   * - JSON-RPC Methods:
   *   - JSON-RPC Accounts: [`personal_sign`](https://docs.metamask.io/guide/signing-data#personal-sign)
   *   - Local Accounts: Signs locally. No JSON-RPC request.
   *
   * With the calculated signature, you can:
   * - use [`verifyMessage`](https://viem.sh/docs/utilities/verifyMessage) to verify the signature,
   * - use [`recoverMessageAddress`](https://viem.sh/docs/utilities/recoverMessageAddress) to recover the signing address from a signature.
   *
   * @param args - {@link SignMessageParameters}
   * @returns The signed message. {@link SignMessageReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const signature = await client.signMessage({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   message: 'hello world',
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const signature = await client.signMessage({
   *   message: 'hello world',
   * })
   */
  signMessage: (
    args: SignMessageParameters<account>,
  ) => Promise<SignMessageReturnType>
  /**
   * Signs a transaction.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/signTransaction
   * - JSON-RPC Methods:
   *   - JSON-RPC Accounts: [`eth_signTransaction`](https://ethereum.github.io/execution-apis/api-documentation/)
   *   - Local Accounts: Signs locally. No JSON-RPC request.
   *
   * @param args - {@link SignTransactionParameters}
   * @returns The signed message. {@link SignTransactionReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const request = await client.prepareTransactionRequest({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x0000000000000000000000000000000000000000',
   *   value: 1n,
   * })
   * const signature = await client.signTransaction(request)
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const request = await client.prepareTransactionRequest({
   *   to: '0x0000000000000000000000000000000000000000',
   *   value: 1n,
   * })
   * const signature = await client.signTransaction(request)
   */
  signTransaction: <
    chainOverride extends Chain | undefined,
    const request extends SignTransactionRequest<
      chain,
      chainOverride
    > = SignTransactionRequest<chain, chainOverride>,
  >(
    args: SignTransactionParameters<chain, account, chainOverride, request>,
  ) => Promise<SignTransactionReturnType<request>>
  /**
   * Signs typed data and calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/signTypedData
   * - JSON-RPC Methods:
   *   - JSON-RPC Accounts: [`eth_signTypedData_v4`](https://docs.metamask.io/guide/signing-data#signtypeddata-v4)
   *   - Local Accounts: Signs locally. No JSON-RPC request.
   *
   * @param client - Client to use
   * @param args - {@link SignTypedDataParameters}
   * @returns The signed data. {@link SignTypedDataReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const signature = await client.signTypedData({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   domain: {
   *     name: 'Ether Mail',
   *     version: '1',
   *     chainId: 1,
   *     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
   *   },
   *   types: {
   *     Person: [
   *       { name: 'name', type: 'string' },
   *       { name: 'wallet', type: 'address' },
   *     ],
   *     Mail: [
   *       { name: 'from', type: 'Person' },
   *       { name: 'to', type: 'Person' },
   *       { name: 'contents', type: 'string' },
   *     ],
   *   },
   *   primaryType: 'Mail',
   *   message: {
   *     from: {
   *       name: 'Cow',
   *       wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
   *     },
   *     to: {
   *       name: 'Bob',
   *       wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
   *     },
   *     contents: 'Hello, Bob!',
   *   },
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * })
   * const signature = await client.signTypedData({
   *   domain: {
   *     name: 'Ether Mail',
   *     version: '1',
   *     chainId: 1,
   *     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
   *   },
   *   types: {
   *     Person: [
   *       { name: 'name', type: 'string' },
   *       { name: 'wallet', type: 'address' },
   *     ],
   *     Mail: [
   *       { name: 'from', type: 'Person' },
   *       { name: 'to', type: 'Person' },
   *       { name: 'contents', type: 'string' },
   *     ],
   *   },
   *   primaryType: 'Mail',
   *   message: {
   *     from: {
   *       name: 'Cow',
   *       wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
   *     },
   *     to: {
   *       name: 'Bob',
   *       wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
   *     },
   *     contents: 'Hello, Bob!',
   *   },
   * })
   */
  signTypedData: <
    const typedData extends TypedData | { [key: string]: unknown },
    primaryType extends string,
  >(
    args: SignTypedDataParameters<typedData, primaryType, account>,
  ) => Promise<SignTypedDataReturnType>
  /**
   * Switch the target chain in a wallet.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/switchChain
   * - JSON-RPC Methods: [`eth_switchEthereumChain`](https://eips.ethereum.org/EIPS/eip-3326)
   *
   * @param args - {@link SwitchChainParameters}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet, optimism } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * await client.switchChain({ id: optimism.id })
   */
  switchChain: (args: SwitchChainParameters) => Promise<void>
  /**
   * Waits for the status & receipts of a call bundle that was sent via `sendCalls`.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/waitForCallsStatus
   * - JSON-RPC Methods: [`wallet_getCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
   *
   * @param client - Client to use
   * @param parameters - {@link WaitForCallsStatusParameters}
   * @returns Status & receipts of the call bundle. {@link WaitForCallsStatusReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   *
   * const { receipts, status } = await waitForCallsStatus(client, { id: '0xdeadbeef' })
   */
  waitForCallsStatus: (
    parameters: WaitForCallsStatusParameters,
  ) => Promise<WaitForCallsStatusReturnType>
  /**
   * Adds an EVM chain to the wallet.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/watchAsset
   * - JSON-RPC Methods: [`eth_switchEthereumChain`](https://eips.ethereum.org/EIPS/eip-747)
   *
   * @param args - {@link WatchAssetParameters}
   * @returns Boolean indicating if the token was successfully added. {@link WatchAssetReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const success = await client.watchAsset({
   *   type: 'ERC20',
   *   options: {
   *     address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
   *     decimals: 18,
   *     symbol: 'WETH',
   *   },
   * })
   */
  watchAsset: (args: WatchAssetParameters) => Promise<WatchAssetReturnType>
  /**
   * Executes a write function on a contract.
   *
   * - Docs: https://viem.sh/docs/contract/writeContract
   * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_writing-to-contracts
   *
   * A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms) is needed to be broadcast in order to change the state.
   *
   * Internally, uses a [Wallet Client](https://viem.sh/docs/clients/wallet) to call the [`sendTransaction` action](https://viem.sh/docs/actions/wallet/sendTransaction) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
   *
   * __Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract#usage) before you execute it.__
   *
   * @param args - {@link WriteContractParameters}
   * @returns A [Transaction Hash](https://viem.sh/docs/glossary/terms#hash). {@link WriteContractReturnType}
   *
   * @example
   * import { createWalletClient, custom, parseAbi } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const hash = await client.writeContract({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
   *   functionName: 'mint',
   *   args: [69420],
   * })
   *
   * @example
   * // With Validation
   * import { createWalletClient, custom, parseAbi } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const { request } = await client.simulateContract({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
   *   functionName: 'mint',
   *   args: [69420],
   * }
   * const hash = await client.writeContract(request)
   */
  writeContract: <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'payable' | 'nonpayable'>,
    args extends ContractFunctionArgs<
      abi,
      'payable' | 'nonpayable',
      functionName
    >,
    chainOverride extends Chain | undefined = undefined,
  >(
    args: WriteContractParameters<
      abi,
      functionName,
      args,
      chain,
      account,
      chainOverride
    >,
  ) => Promise<WriteContractReturnType>
  /**
   * Executes a write function on a contract synchronously.
   * Returns the transaction receipt.
   *
   * - Docs: https://viem.sh/docs/contract/writeContract
   *
   * A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms) is needed to be broadcast in order to change the state.
   *
   * Internally, uses a [Wallet Client](https://viem.sh/docs/clients/wallet) to call the [`sendTransaction` action](https://viem.sh/docs/actions/wallet/sendTransaction) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
   *
   * __Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract#usage) before you execute it.__
   *
   * @param args - {@link WriteContractSyncParameters}
   * @returns A [Transaction Receipt](https://viem.sh/docs/glossary/terms#receipt). {@link WriteContractSyncReturnType}
   *
   * @example
   * import { createWalletClient, custom, parseAbi } from 'viem'
   * import { mainnet } from 'viem/chains'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * })
   * const receipt = await client.writeContractSync({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
   *   functionName: 'mint',
   *   args: [69420],
   * })
   */
  writeContractSync: <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'payable' | 'nonpayable'>,
    args extends ContractFunctionArgs<
      abi,
      'payable' | 'nonpayable',
      functionName
    >,
    chainOverride extends Chain | undefined = undefined,
  >(
    args: WriteContractSyncParameters<
      abi,
      functionName,
      args,
      chain,
      account,
      chainOverride
    >,
  ) => Promise<WriteContractSyncReturnType>
}

export function walletActions<
  transport extends Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>(client: Client<transport, chain, account>): WalletActions<chain, account> {
  return {
    addChain: (args) => addChain(client, args),
    deployContract: (args) => deployContract(client, args),
    fillTransaction: (args) => fillTransaction(client, args),
    getAddresses: () => getAddresses(client),
    getCallsStatus: (args) => getCallsStatus(client, args),
    getCapabilities: (args) => getCapabilities(client, args),
    getChainId: () => getChainId(client),
    getPermissions: () => getPermissions(client),
    prepareAuthorization: (args) => prepareAuthorization(client, args),
    prepareTransactionRequest: (args) =>
      prepareTransactionRequest(client as any, args as any) as any,
    requestAddresses: () => requestAddresses(client),
    requestPermissions: (args) => requestPermissions(client, args),
    sendCalls: (args) => sendCalls(client, args),
    sendCallsSync: (args) => sendCallsSync(client, args),
    sendRawTransaction: (args) => sendRawTransaction(client, args),
    sendRawTransactionSync: (args) => sendRawTransactionSync(client, args),
    sendTransaction: (args) => sendTransaction(client, args),
    sendTransactionSync: (args) => sendTransactionSync(client, args),
    showCallsStatus: (args) => showCallsStatus(client, args),
    signAuthorization: (args) => signAuthorization(client, args),
    signMessage: (args) => signMessage(client, args),
    signTransaction: (args) => signTransaction(client, args),
    signTypedData: (args) => signTypedData(client, args),
    switchChain: (args) => switchChain(client, args),
    waitForCallsStatus: (args) => waitForCallsStatus(client, args),
    watchAsset: (args) => watchAsset(client, args),
    writeContract: (args) => writeContract(client, args as any),
    writeContractSync: (args) => writeContractSync(client, args as any),
  }
}
