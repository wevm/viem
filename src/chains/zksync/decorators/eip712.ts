import { writeContract } from '../../../actions/wallet/writeContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { WalletActions } from '../../../clients/decorators/wallet.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
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
   * import { zkSync } from 'viem/chains'
   * import { eip712WalletActions } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   chain: zkSync,
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
   * import { zkSync } from 'viem/chains'
   * import { eip712WalletActions } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: zkSync,
   *   transport: http(),
   * }).extend(eip712WalletActions())
   * const hash = await client.sendTransaction({
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: 1000000000000000000n,
   * })
   */
  sendTransaction: <chainOverride extends ChainEIP712 | undefined = undefined>(
    args: SendTransactionParameters<chain, account, chainOverride>,
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
   * @returns The signed serialized tranasction. {@link SignTransactionReturnType}
   *
   * @example
   * import { createWalletClient, custom } from 'viem'
   * import { zkSync } from 'viem/chains'
   * import { eip712WalletActions } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   chain: zkSync,
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
   * import { zkSync } from 'viem/chains'
   * import { eip712WalletActions } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: zkSync,
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
   * Executes a write function on a contract.
   *
   * - Docs: https://viem.sh/docs/contract/writeContract
   * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts/writing-to-contracts
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
   * import { zkSync } from 'viem/chains'
   * import { eip712WalletActions } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   chain: zkSync,
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
   * import { zkSync } from 'viem/chains'
   * import { eip712WalletActions } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   chain: zkSync,
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
    writeContract: (args) =>
      writeContract(
        Object.assign(client, {
          sendTransaction: (args: any) => sendTransaction(client, args),
        }),
        args,
      ),
  })
}
