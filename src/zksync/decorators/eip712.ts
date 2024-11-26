import type { Abi } from 'abitype'

import type { SendTransactionRequest } from '../../actions/wallet/sendTransaction.js'
import { writeContract } from '../../actions/wallet/writeContract.js'
import type { Client } from '../../clients/createClient.js'
import type { WalletActions } from '../../clients/decorators/wallet.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import {
  type DeployContractParameters,
  type DeployContractReturnType,
  deployContract,
} from '../actions/deployContract.js'
import {
  type SendTransactionParameters,
  type SendTransactionReturnType,
  sendTransaction,
} from '../actions/sendTransaction.js'
import {
  type SignTransactionParameters,
  type SignTransactionReturnType,
  signTransaction,
} from '../actions/signTransaction.js'
import type { ChainEIP712 } from '../types/chain.js'

export type Eip712WalletActions<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Creates, signs, and sends a new transaction to the network.
   *
   * - Docs: https://viem.sh/docs/zksync/actions/sendTransaction
   * - JSON-RPC Methods:
   *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
   *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
   *
   * @param client - Client to use
   * @param parameters - {@link SendTransactionParameters}
   * @returns The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link SendTransactionReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { zksync } from 'viem/chains'
   * import { eip712WalletActions } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   chain: zksync,
   *   transport: custom(window.ethereum),
   * }).extend(eip712WalletActions())
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
   * import { zksync } from 'viem/chains'
   * import { eip712WalletActions } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: zksync,
   *   transport: http(),
   * }).extend(eip712WalletActions())
   * const hash = await client.sendTransaction({
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: 1000000000000000000n,
   * })
   */
  sendTransaction: <
    const request extends SendTransactionRequest<chain, chainOverride>,
    chainOverride extends ChainEIP712 | undefined = undefined,
  >(
    args: SendTransactionParameters<chain, account, chainOverride, request>,
  ) => Promise<SendTransactionReturnType>
  /**
   * Signs a transaction.
   *
   * - Docs: https://viem.sh/docs/actions/wallet/signTransaction
   * - JSON-RPC Methods:
   *   - JSON-RPC Accounts: [`eth_signTransaction`](https://ethereum.github.io/execution-apis/api-documentation/)
   *   - Local Accounts: Signs locally. No JSON-RPC request.
   *
   * @param args - {@link SignTransactionParameters}
   * @returns The signed serialized transaction. {@link SignTransactionReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { zksync } from 'viem/chains'
   * import { eip712WalletActions } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   chain: zksync,
   *   transport: custom(window.ethereum),
   * }).extend(eip712WalletActions())
   * const signature = await client.signTransaction({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x0000000000000000000000000000000000000000',
   *   value: 1n,
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { zksync } from 'viem/chains'
   * import { eip712WalletActions } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: zksync,
   *   transport: custom(window.ethereum),
   * }).extend(eip712WalletActions())
   * const signature = await client.signTransaction({
   *   to: '0x0000000000000000000000000000000000000000',
   *   value: 1n,
   * })
   */
  signTransaction: <chainOverride extends ChainEIP712 | undefined = undefined>(
    args: SignTransactionParameters<chain, account, chainOverride>,
  ) => Promise<SignTransactionReturnType>
  /**
   * Deploys a contract to the network, given bytecode and constructor arguments using EIP712 transaction.
   *
   * - Docs: https://viem.sh/docs/contract/deployContract
   * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_deploying-contracts
   *
   * @param args - {@link DeployContractParameters}
   * @returns The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link DeployContractReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { zksync } from 'viem/chains'
   * import { deployContract } from 'viem/contract'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: zksync,
   *   transport: custom(provider),
   * })
   * const hash = await client.deployContract(client, {
   *   abi: [],
   *   account: '0x…,
   *   deploymentType: 'create',
   *   bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
   *   factoryDeps: ['0x608060405260405161083e38038061083e833981016040819052610...'],
   *   gasPerPubdata: 50000n
   * })
   */
  deployContract: <
    const abi extends Abi | readonly unknown[],
    chainOverride extends ChainEIP712 | undefined,
  >(
    args: DeployContractParameters<
      abi,
      ChainEIP712 | undefined,
      Account | undefined,
      chainOverride
    >,
  ) => Promise<DeployContractReturnType>
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
   * @param client - Client to use
   * @param parameters - {@link WriteContractParameters}
   * @returns A [Transaction Hash](https://viem.sh/docs/glossary/terms#hash). {@link WriteContractReturnType}
   *
   * @example
   * import { createWalletClient, custom, parseAbi } from 'viem'
   * import { zksync } from 'viem/chains'
   * import { eip712WalletActions } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   chain: zksync,
   *   transport: custom(window.ethereum),
   * }).extend(eip712WalletActions())
   * const hash = await client.writeContract({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
   *   functionName: 'mint',
   *   args: [69420],
   * })
   *
   * @example
   * // With Validation
   * import { createWalletClient, http, parseAbi } from 'viem'
   * import { zksync } from 'viem/chains'
   * import { eip712WalletActions } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   chain: zksync,
   *   transport: http(),
   * }).extend(eip712WalletActions())
   * const { request } = await client.simulateContract({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
   *   functionName: 'mint',
   *   args: [69420],
   * }
   * const hash = await client.writeContract(request)
   */
  writeContract: WalletActions<chain, account>['writeContract']
}

export function eip712WalletActions() {
  return <
    transport extends Transport,
    chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): Eip712WalletActions<chain, account> => ({
    sendTransaction: (args) => sendTransaction(client, args),
    signTransaction: (args) => signTransaction(client, args),
    deployContract: (args) => deployContract(client, args),
    writeContract: (args) =>
      writeContract(
        Object.assign(client, {
          sendTransaction: (args: any) => sendTransaction(client, args),
        }),
        args,
      ),
  })
}
