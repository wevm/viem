import type { Abi } from 'abitype'
import type { Account } from '../../../types/account.js'
import { 
  prepareEip712TransactionRequest,
  type PrepareEip712TransactionRequestParameters,
  type PrepareEip712TransactionRequestReturnType
} from '../actions/prepareEip712TransactionRequest.js'
import { 
  sendEip712Transaction,
  type SendEip712TransactionParameters,
  type SendEip712TransactionReturnType
} from '../actions/sendEip712Transaction.js'
import { 
  signEip712Transaction,
  type SignEip712TransactionParameters,
  type SignEip712TransactionReturnType
} from '../actions/signEip712Transaction.js'
import {
  writeEip712Contract,
  type WriteEip712ContractParameters,
  type WriteEip712ContractReturnType
} from '../actions/writeEip712Contract.js'
import type { ChainEIP712 } from '../types/chain.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'

export type Eip712Actions<
  TChain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  TAccount extends Account | undefined = Account | undefined
> = {
/**
 * Prepares a transaction request for signing.
 *
 * - Docs: https://viem.sh/docs/zksync/actions/prepareEip712TransactionRequest.html
 *
 * @param args - {@link PrepareEip712TransactionRequestParameters}
 * @returns The transaction request. {@link PrepareEip712TransactionRequestReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { prepareEip712TransactionRequest } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const request = await prepareEip712TransactionRequest(client, {
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
 * import { prepareEip712TransactionRequest } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const request = await prepareEip712TransactionRequest(client, {
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 */
  prepareEip712TransactionRequest: <
    TChainOverride extends ChainEIP712 | undefined = undefined
  >(
    args: PrepareEip712TransactionRequestParameters<
      TChain,
      TAccount,
      TChainOverride
    >,
  ) => Promise<
    PrepareEip712TransactionRequestReturnType<TChain, TAccount, TChainOverride>
  >

/**
 * Creates, signs, and sends a new transaction to the network.
 *
 * - Docs: https://viem.sh/docs/zksync/actions/sendEip712Transaction.html
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
 *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
 *
 * @param client - Client to use
 * @param parameters - {@link SendEip712TransactionParameters}
 * @returns The [Transaction](https://viem.sh/docs/glossary/terms.html#transaction) hash. {@link SendEip712TransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { sendEip712Transaction } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await sendEip712Transaction(client, {
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
 * import { sendEip712Transaction } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: zkSync,
 *   transport: http(),
 * })
 * const hash = await sendEip712Transaction(client, {
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 */
  sendEip712Transaction: <
    TChainOverride extends ChainEIP712 | undefined = undefined
  >(
    args: SendEip712TransactionParameters<
      TChain, 
      TAccount, 
      TChainOverride
    >,
  ) => Promise<SendEip712TransactionReturnType>

/**
 * Signs a transaction.
 *
 * - Docs: https://viem.sh/docs/zksync/actions/signEip712Transaction.html
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_signTransaction`](https://ethereum.github.io/execution-apis/api-documentation/)
 *   - Local Accounts: Signs locally. No JSON-RPC request.
 *
 * @param args - {@link SignEip712TransactionParameters}
 * @returns The signed serialized tranasction. {@link SignEip712TransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { sign712Transaction } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signEip712Transaction(client, {
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
 * import { sign712Transaction } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signEip712Transaction(client, {
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 */
  signEip712Transaction: <
    TChainOverride extends ChainEIP712 | undefined = undefined
  >(
    args: SignEip712TransactionParameters<
      TChain, 
      TAccount, 
      TChainOverride
    >,
  ) => Promise<SignEip712TransactionReturnType>

/**
 * Executes a write function on a contract.
 *
 * - Docs: https://viem.sh/docs/zksync/actions/writeEip712Contract.html
 *
 * A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms.html) is needed to be broadcast in order to change the state.
 *
 * Internally, uses a [Wallet Client](https://viem.sh/docs/clients/wallet.html) to call the [`sendEip712Transaction` action](https://viem.sh/docs/zksync/actions/sendEip712Transaction.html) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData.html).
 *
 * __Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract.html#usage) before you execute it.__
 *
 * @param client - Client to use
 * @param parameters - {@link WriteEip712ContractParameters}
 * @returns A [Transaction Hash](https://viem.sh/docs/glossary/terms.html#hash). {@link WriteEip712ContractReturnType}
 *
 * @example
 * import { createWalletClient, custom, parseAbi } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { writeContract } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await writeEip712Contract(client, {
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
 * import { simulateContract } from 'viem/contract'
 * import { writeEip712Contract } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   chain: zkSync,
 *   transport: http(),
 * })
 * const { request } = await simulateContract(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
 *   functionName: 'mint',
 *   args: [69420],
 * }
 * const hash = await writeEip712Contract(client, request)
 */
  writeEip712Contract: <
    const TAbi extends Abi | readonly unknown[],
    TFunctionName extends string,
    TChainOverride extends ChainEIP712 | undefined = undefined
  >(
    args: WriteEip712ContractParameters<
      TAbi,
      TFunctionName,
      TChain,
      TAccount,
      TChainOverride
    >,
  ) => Promise<WriteEip712ContractReturnType>
}

export function eip712Actions() {
  return <
    TTransport extends Transport,
    TChain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
    TAccount extends Account | undefined = Account | undefined,
  >(
    client: Client<TTransport, TChain, TAccount>,
  ): Eip712Actions<TChain, TAccount> => {
    return {
      prepareEip712TransactionRequest: (args) => prepareEip712TransactionRequest(client, args),
      sendEip712Transaction: (args) => sendEip712Transaction(client, args),
      signEip712Transaction: (args) => signEip712Transaction(client, args),
      writeEip712Contract: (args) => writeEip712Contract(client, args)
    }
  }
}
