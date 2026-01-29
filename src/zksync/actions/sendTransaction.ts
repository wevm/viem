import type { Account } from '../../accounts/types.js'
import { sendTransaction as core_sendTransaction } from '../../actions/wallet/sendTransaction.js'
import type {
  SendTransactionRequest,
  SendTransactionErrorType as core_SendTransactionErrorType,
  SendTransactionParameters as core_SendTransactionParameters,
  SendTransactionReturnType as core_SendTransactionReturnType,
} from '../../actions/wallet/sendTransaction.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ChainEIP712 } from '../types/chain.js'
import { isEIP712Transaction } from '../utils/isEip712Transaction.js'
import {
  type SendEip712TransactionParameters,
  sendEip712Transaction,
} from './sendEip712Transaction.js'

export type SendTransactionParameters<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  request extends SendTransactionRequest<
    chain,
    chainOverride
  > = SendTransactionRequest<chain, chainOverride>,
> = core_SendTransactionParameters<chain, account, chainOverride, request>

export type SendTransactionReturnType = core_SendTransactionReturnType

export type SendTransactionErrorType = core_SendTransactionErrorType

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
 * import { sendTransaction } from 'viem/zksync'
 *
 * const client = createWalletClient({
 *   chain: zksync,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await sendTransaction(client, {
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
 * import { sendTransaction } from 'viem/zksync'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: zksync,
 *   transport: http(),
 * })
 * const hash = await sendTransaction(client, {
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 */
export async function sendTransaction<
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
  const request extends SendTransactionRequest<chain, chainOverride>,
  chainOverride extends ChainEIP712 | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: SendTransactionParameters<chain, account, chainOverride, request>,
): Promise<SendTransactionReturnType> {
  if (isEIP712Transaction(parameters))
    return sendEip712Transaction(
      client,
      parameters as SendEip712TransactionParameters,
    )
  return core_sendTransaction(
    client,
    parameters as core_SendTransactionParameters,
  )
}
