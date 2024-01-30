import type { Account } from '../../../accounts/types.js'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import { getChainId } from '../../../actions/public/getChainId.js'
import { prepareTransactionRequest } from '../../../actions/wallet/prepareTransactionRequest.js'
import { sendRawTransaction } from '../../../actions/wallet/sendRawTransaction.js'
import type {
  SendTransactionErrorType,
  SendTransactionParameters as SendTransactionParameters_,
  SendTransactionReturnType,
} from '../../../actions/wallet/sendTransaction.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import { BaseError } from '../../../errors/base.js'
import type { Chain } from '../../../types/chain.js'
import { assertCurrentChain } from '../../../utils/chain/assertCurrentChain.js'
import {
  type GetTransactionErrorParameters,
  getTransactionError,
} from '../../../utils/errors/getTransactionError.js'
import { getAction } from '../../../utils/getAction.js'
import { type ChainEIP712 } from '../types/chain.js'
import { assertEip712Request } from '../utils/assertEip712Request.js'
import { signTransaction } from './signTransaction.js'

export type SendEip712TransactionParameters<
  TChain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
> = SendTransactionParameters_<TChain, TAccount, TChainOverride>

export type SendEip712TransactionReturnType = SendTransactionReturnType

export type SendEip712TransactionErrorType = SendTransactionErrorType

/**
 * Creates, signs, and sends a new EIP712 transaction to the network.
 *
 * @param client - Client to use
 * @param parameters - {@link SendEip712TransactionParameters}
 * @returns The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link SendTransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { sendEip712Transaction } from 'viem/zksync'
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
 * import { sendEip712Transaction } from 'viem/zksync'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: zkSync,
 *   transport: http(),
 * })
 *
 * const hash = await sendEip712Transaction(client, {
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 */
export async function sendEip712Transaction<
  TChain extends ChainEIP712 | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends ChainEIP712 | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  args: SendEip712TransactionParameters<TChain, TAccount, TChainOverride>,
): Promise<SendEip712TransactionReturnType> {
  const { chain = client.chain } = args

  if (!args.account)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/sendTransaction',
    })
  const account = parseAccount(args.account)

  try {
    assertEip712Request(args)

    // Prepare the request for signing (assign appropriate fees, etc.)
    const request = await prepareTransactionRequest(client, {
      ...args,
      parameters: ['gas', 'nonce'],
    } as any)

    let chainId: number | undefined
    if (chain !== null) {
      chainId = await getAction(client, getChainId, 'getChainId')({})
      assertCurrentChain({
        currentChainId: chainId,
        chain,
      })
    }

    const serializedTransaction = await signTransaction(client, {
      ...request,
      chainId,
    } as any)

    return await getAction(
      client,
      sendRawTransaction,
      'sendRawTransaction',
    )({
      serializedTransaction,
    })
  } catch (err) {
    throw getTransactionError(err as BaseError, {
      ...(args as GetTransactionErrorParameters),
      account,
      chain: chain as Chain,
    })
  }
}
