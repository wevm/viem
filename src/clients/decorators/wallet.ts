import type { Abi, TypedData } from 'abitype'

import type { Account } from '../../accounts/types.js'
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
  type GetPermissionsReturnType,
  getPermissions,
} from '../../actions/wallet/getPermissions.js'
import {
  type PrepareTransactionRequestParameters,
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
  type SendRawTransactionParameters,
  type SendRawTransactionReturnType,
  sendRawTransaction,
} from '../../actions/wallet/sendRawTransaction.js'
import {
  type SendTransactionParameters,
  type SendTransactionReturnType,
  sendTransaction,
} from '../../actions/wallet/sendTransaction.js'
import {
  type SignMessageParameters,
  type SignMessageReturnType,
  signMessage,
} from '../../actions/wallet/signMessage.js'
import {
  type SignTransactionParameters,
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
  type WatchAssetParameters,
  type WatchAssetReturnType,
  watchAsset,
} from '../../actions/wallet/watchAsset.js'
import {
  type WriteContractParameters,
  type WriteContractReturnType,
  writeContract,
} from '../../actions/wallet/writeContract.js'
import type { Chain } from '../../types/chain.js'
import type { Client } from '../createClient.js'
import type { Transport } from '../transports/createTransport.js'

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
   * - Docs: https://viem.sh/docs/contract/deployContract.html
   * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts/deploying-contracts
   *
   * @param args - {@link DeployContractParameters}
   * @returns The [Transaction](https://viem.sh/docs/glossary/terms.html#transaction) hash. {@link DeployContractReturnType}
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
    const TAbi extends Abi | readonly unknown[],
    TChainOverride extends Chain | undefined = undefined,
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
   * Prepares a transaction request for signing.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/prepareTransactionRequest.html
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
    TChainOverride extends Chain | undefined = undefined,
  >(
    args: PrepareTransactionRequestParameters<TChain, TAccount, TChainOverride>,
  ) => Promise<PrepareTransactionRequestReturnType>
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
   * Sends a **signed** transaction to the network
   *
   * - Docs: https://viem.sh/docs/actions/wallet/sendRawTransaction.html
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
   * Creates, signs, and sends a new transaction to the network.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/sendTransaction.html
   * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions/sending-transactions
   * - JSON-RPC Methods:
   *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
   *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
   *
   * @param args - {@link SendTransactionParameters}
   * @returns The [Transaction](https://viem.sh/docs/glossary/terms.html#transaction) hash. {@link SendTransactionReturnType}
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
  sendTransaction: <TChainOverride extends Chain | undefined = undefined>(
    args: SendTransactionParameters<TChain, TAccount, TChainOverride>,
  ) => Promise<SendTransactionReturnType>
  /**
   * Calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/signMessage.html
   * - JSON-RPC Methods:
   *   - JSON-RPC Accounts: [`personal_sign`](https://docs.metamask.io/guide/signing-data.html#personal-sign)
   *   - Local Accounts: Signs locally. No JSON-RPC request.
   *
   * With the calculated signature, you can:
   * - use [`verifyMessage`](https://viem.sh/docs/utilities/verifyMessage.html) to verify the signature,
   * - use [`recoverMessageAddress`](https://viem.sh/docs/utilities/recoverMessageAddress.html) to recover the signing address from a signature.
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
    args: SignMessageParameters<TAccount>,
  ) => Promise<SignMessageReturnType>
  /**
   * Signs a transaction.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/signTransaction.html
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
  signTransaction: <TChainOverride extends Chain | undefined = undefined>(
    args: SignTransactionParameters<TChain, TAccount, TChainOverride>,
  ) => Promise<SignTransactionReturnType>
  /**
   * Signs typed data and calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/signTypedData.html
   * - JSON-RPC Methods:
   *   - JSON-RPC Accounts: [`eth_signTypedData_v4`](https://docs.metamask.io/guide/signing-data.html#signtypeddata-v4)
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
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string,
  >(
    args: SignTypedDataParameters<TTypedData, TPrimaryType, TAccount>,
  ) => Promise<SignTypedDataReturnType>
  /**
   * Switch the target chain in a wallet.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/switchChain.html
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
   * Adds an EVM chain to the wallet.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/watchAsset.html
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
   * - Docs: https://viem.sh/docs/contract/writeContract.html
   * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts/writing-to-contracts
   *
   * A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms.html) is needed to be broadcast in order to change the state.
   *
   * Internally, uses a [Wallet Client](https://viem.sh/docs/clients/wallet.html) to call the [`sendTransaction` action](https://viem.sh/docs/actions/wallet/sendTransaction.html) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData.html).
   *
   * __Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract.html#usage) before you execute it.__
   *
   * @param args - {@link WriteContractParameters}
   * @returns A [Transaction Hash](https://viem.sh/docs/glossary/terms.html#hash). {@link WriteContractReturnType}
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
    const TAbi extends Abi | readonly unknown[],
    TFunctionName extends string,
    TChainOverride extends Chain | undefined = undefined,
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

export function walletActions<
  TTransport extends Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
): WalletActions<TChain, TAccount> {
  return {
    addChain: (args) => addChain(client, args),
    deployContract: (args) => deployContract(client, args),
    getAddresses: () => getAddresses(client),
    getChainId: () => getChainId(client),
    getPermissions: () => getPermissions(client),
    prepareTransactionRequest: (args) =>
      prepareTransactionRequest(client as any, args as any),
    requestAddresses: () => requestAddresses(client),
    requestPermissions: (args) => requestPermissions(client, args),
    sendRawTransaction: (args) => sendRawTransaction(client, args),
    sendTransaction: (args) => sendTransaction(client, args),
    signMessage: (args) => signMessage(client, args),
    signTransaction: (args) => signTransaction(client, args),
    signTypedData: (args) => signTypedData(client, args),
    switchChain: (args) => switchChain(client, args),
    watchAsset: (args) => watchAsset(client, args),
    writeContract: (args) => writeContract(client, args),
  }
}
