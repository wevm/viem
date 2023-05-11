import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { WalletClient } from '../../clients/createWalletClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import type { BaseError } from '../../errors/base.js'
import type { GetAccountParameter } from '../../types/account.js'
import type { Chain, GetChain } from '../../types/chain.js'
import type { Formatter } from '../../types/formatter.js'
import type { Hash } from '../../types/misc.js'
import type {
  TransactionRequest,
  TransactionSerializable,
} from '../../types/transaction.js'
import type { MergeIntersectionProperties } from '../../types/utils.js'
import { assertCurrentChain } from '../../utils/chain.js'
import { getTransactionError } from '../../utils/errors/getTransactionError.js'
import { extract } from '../../utils/formatters/extract.js'
import { type Formatted, format } from '../../utils/formatters/format.js'
import {
  type TransactionRequestFormatter,
  formatTransactionRequest,
} from '../../utils/formatters/transactionRequest.js'
import { assertRequest } from '../../utils/transaction/assertRequest.js'
import { prepareRequest } from '../../utils/transaction/prepareRequest.js'
import { getChainId } from '../public/getChainId.js'

export type FormattedTransactionRequest<
  TFormatter extends Formatter | undefined = Formatter,
> = MergeIntersectionProperties<
  Omit<Formatted<TFormatter, TransactionRequest, true>, 'from'>,
  TransactionRequest
>

export type SendTransactionParameters<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = Chain,
> = FormattedTransactionRequest<TransactionRequestFormatter<TChainOverride>> &
  GetAccountParameter<TAccount> &
  GetChain<TChain, TChainOverride>

export type SendTransactionReturnType = Hash

/**
 * Creates, signs, and sends a new transaction to the network.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/sendTransaction.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions/sending-transactions
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
 *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
 *
 * @param client - Client to use
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
 * import { mainnet } from 'viem/chains'
 * import { sendTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const hash = await sendTransaction(client, {
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 */
export async function sendTransaction<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined,
>(
  client: WalletClient<Transport, TChain, TAccount>,
  args: SendTransactionParameters<TChain, TAccount, TChainOverride>,
): Promise<SendTransactionReturnType> {
  const {
    account: account_ = client.account,
    chain = client.chain,
    accessList,
    data,
    gas,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    to,
    value,
    ...rest
  } = args

  if (!account_)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/sendTransaction',
    })
  const account = parseAccount(account_)

  try {
    assertRequest(args)

    let chainId
    if (chain !== null) {
      chainId = await getChainId(client)
      assertCurrentChain({
        currentChainId: chainId,
        chain,
      })
    }

    if (account.type === 'local') {
      // Prepare the request for signing (assign appropriate fees, etc.)
      const request = await prepareRequest(client, {
        account,
        accessList,
        chain,
        data,
        gas,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        value,
        ...rest,
      })

      if (!chainId) chainId = await getChainId(client)
      const signedRequest = (await account.signTransaction({
        chainId,
        ...request,
      } as TransactionSerializable)) as Hash
      return await client.request({
        method: 'eth_sendRawTransaction',
        params: [signedRequest],
      })
    }

    const formatter = chain?.formatters?.transactionRequest
    const request = format(
      {
        accessList,
        data,
        from: account.address,
        gas,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        value,
        // Pick out extra data that might exist on the chain's transaction request type.
        ...extract(rest, { formatter }),
      } as TransactionRequest,
      {
        formatter: formatter || formatTransactionRequest,
      },
    )
    return await client.request({
      method: 'eth_sendTransaction',
      params: [request],
    })
  } catch (err) {
    throw getTransactionError(err as BaseError, {
      ...args,
      account,
      chain: args.chain || undefined,
    })
  }
}
