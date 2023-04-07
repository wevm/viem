import type { Transport, WalletClient } from '../../clients/index.js'
import type { BaseError } from '../../errors/index.js'
import {
  AccountNotFoundError,
  ChainMismatchError,
  ChainNotFoundError,
} from '../../errors/index.js'
import type {
  Account,
  GetAccountParameter,
  Chain,
  Formatter,
  GetChain,
  Hash,
  MergeIntersectionProperties,
  TransactionRequest,
  TransactionSerializable,
} from '../../types/index.js'
import {
  assertRequest,
  extract,
  format,
  formatTransactionRequest,
  getTransactionError,
  parseAccount,
  prepareRequest,
} from '../../utils/index.js'
import type {
  Formatted,
  TransactionRequestFormatter,
} from '../../utils/index.js'
import { getChainId } from '../public/index.js'

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

    const chainId = await getChainId(client)
    if (chain !== null && chainId !== chain?.id) {
      if (!chain) throw new ChainNotFoundError()
      throw new ChainMismatchError({ chain, currentChainId: chainId })
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
