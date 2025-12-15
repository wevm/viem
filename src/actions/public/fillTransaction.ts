import type { Address } from 'abitype'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseError } from '../../errors/base.js'
import { BaseFeeScalarError } from '../../errors/fee.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account, GetAccountParameter } from '../../types/account.js'
import type {
  Chain,
  ChainFeesFnParameters,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { TransactionRequest } from '../../types/transaction.js'
import type { UnionOmit } from '../../types/utils.js'
import {
  type GetTransactionErrorReturnType,
  getTransactionError,
} from '../../utils/errors/getTransactionError.js'
import { extract } from '../../utils/formatters/extract.js'
import {
  type FormattedTransaction,
  formatTransaction,
} from '../../utils/formatters/transaction.js'
import {
  type FormattedTransactionRequest,
  formatTransactionRequest,
} from '../../utils/formatters/transactionRequest.js'
import { getAction } from '../../utils/getAction.js'
import type { NonceManager } from '../../utils/nonceManager.js'
import { assertRequest } from '../../utils/transaction/assertRequest.js'
import { getBlock } from './getBlock.js'
import { getChainId as getChainId_ } from './getChainId.js'

export type FillTransactionParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
  ///
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = UnionOmit<FormattedTransactionRequest<_derivedChain>, 'from'> &
  GetAccountParameter<account, accountOverride, false, true> &
  GetChainParameter<chain, chainOverride> & {
    /**
     * Nonce manager to use for the transaction request.
     */
    nonceManager?: NonceManager | undefined
  }

export type FillTransactionReturnType<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  ///
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = {
  raw: Hex
  transaction: FormattedTransaction<_derivedChain>
}

export type FillTransactionErrorType =
  | GetTransactionErrorReturnType<ErrorType>
  | ErrorType

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
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { fillTransaction } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const result = await fillTransaction(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: parseEther('1'),
 * })
 */
export async function fillTransaction<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
  accountOverride extends Account | Address | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: FillTransactionParameters<
    chain,
    account,
    chainOverride,
    accountOverride
  >,
): Promise<FillTransactionReturnType<chain, chainOverride>> {
  const {
    account = client.account,
    accessList,
    authorizationList,
    chain = client.chain,
    blobVersionedHashes,
    blobs,
    data,
    gas,
    gasPrice,
    maxFeePerBlobGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce: nonce_,
    nonceManager,
    to,
    type,
    value,
    ...rest
  } = parameters

  const nonce = await (async () => {
    if (!account) return nonce_
    if (!nonceManager) return nonce_
    if (typeof nonce_ !== 'undefined') return nonce_
    const account_ = parseAccount(account)
    const chainId = chain
      ? chain.id
      : await getAction(client, getChainId_, 'getChainId')({})
    return await nonceManager.consume({
      address: account_.address,
      chainId,
      client,
    })
  })()

  assertRequest(parameters)

  const chainFormat = chain?.formatters?.transactionRequest?.format
  const format = chainFormat || formatTransactionRequest

  const request = format(
    {
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
      account: account ? parseAccount(account) : undefined,
      accessList,
      authorizationList,
      blobs,
      blobVersionedHashes,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      type,
      value,
    } as TransactionRequest,
    'fillTransaction',
  )

  try {
    const response = await client.request({
      method: 'eth_fillTransaction',
      params: [request],
    })
    const format = chain?.formatters?.transaction?.format || formatTransaction

    const transaction = format(response.tx)

    // Remove unnecessary fields.
    delete transaction.blockHash
    delete transaction.blockNumber
    delete transaction.r
    delete transaction.s
    delete transaction.transactionIndex
    delete transaction.v
    delete transaction.yParity

    // Rewrite fields.
    transaction.data = transaction.input

    // Preference supplied fees (some nodes do not take these preferences).
    if (transaction.gas) transaction.gas = parameters.gas ?? transaction.gas
    if (transaction.gasPrice)
      transaction.gasPrice = parameters.gasPrice ?? transaction.gasPrice
    if (transaction.maxFeePerBlobGas)
      transaction.maxFeePerBlobGas =
        parameters.maxFeePerBlobGas ?? transaction.maxFeePerBlobGas
    if (transaction.maxFeePerGas)
      transaction.maxFeePerGas =
        parameters.maxFeePerGas ?? transaction.maxFeePerGas
    if (transaction.maxPriorityFeePerGas)
      transaction.maxPriorityFeePerGas =
        parameters.maxPriorityFeePerGas ?? transaction.maxPriorityFeePerGas
    if (transaction.nonce)
      transaction.nonce = parameters.nonce ?? transaction.nonce

    // Build fee multiplier function.
    const feeMultiplier = await (async () => {
      if (typeof chain?.fees?.baseFeeMultiplier === 'function') {
        const block = await getAction(client, getBlock, 'getBlock')({})
        return chain.fees.baseFeeMultiplier({
          block,
          client,
          request: parameters,
        } as ChainFeesFnParameters)
      }
      return chain?.fees?.baseFeeMultiplier ?? 1.2
    })()
    if (feeMultiplier < 1) throw new BaseFeeScalarError()

    const decimals = feeMultiplier.toString().split('.')[1]?.length ?? 0
    const denominator = 10 ** decimals
    const multiplyFee = (base: bigint) =>
      (base * BigInt(Math.ceil(feeMultiplier * denominator))) /
      BigInt(denominator)

    // Apply fee multiplier.
    if (transaction.maxFeePerGas && !parameters.maxFeePerGas)
      transaction.maxFeePerGas = multiplyFee(transaction.maxFeePerGas)
    if (transaction.gasPrice && !parameters.gasPrice)
      transaction.gasPrice = multiplyFee(transaction.gasPrice)

    return {
      raw: response.raw,
      transaction: {
        from: request.from,
        ...transaction,
      },
    }
  } catch (err) {
    throw getTransactionError(
      err as BaseError,
      {
        ...parameters,
        chain: client.chain,
      } as never,
    )
  }
}
