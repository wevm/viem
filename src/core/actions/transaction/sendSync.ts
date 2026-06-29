import * as Authorization from 'ox/Authorization'
import type * as Errors from 'ox/Errors'
import * as Secp256k1 from 'ox/Secp256k1'

import * as Account from '../../Account.js'
import * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import * as RpcError from '../../RpcError.js'
import type * as NonceManager from '../../NonceManager.js'
import * as dataSuffix_ from '../../internal/dataSuffix.js'
import { isAbortError } from '../../internal/errors.js'
import * as transactionRequest from '../internal/transactionRequest.js'
import { getId } from '../chains/getId.js'
import { defaultParameters, prepare } from './prepare.js'
import { send } from './send.js'
import { sendRawSync, TransactionReceiptRevertedError } from './sendRawSync.js'
import { sign } from './sign.js'
import { waitForReceipt } from './waitForReceipt.js'

/**
 * Creates, signs, and sends a new transaction to the network synchronously,
 * returning its receipt.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const receipt = await Actions.transaction.sendSync(client, {
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1n,
 * })
 * ```
 */
export async function sendSync<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: sendSync.Options<chain>,
): Promise<sendSync.ReturnType<chain>> {
  const {
    confirmations,
    pollingInterval,
    throwOnReceiptRevert,
    timeout,
    ...sendOptions
  } = options
  const options_ = sendOptions as send.Options<chain>
  const receiptTimeout =
    timeout ??
    Math.max(
      (((options_.chain === null ? undefined : options_.chain) ?? client.chain)
        ?.blockTime ?? 0) * 3,
      5_000,
    )

  const account_ = options_.account ?? client.account
  if (!account_) throw new Account.NotFoundError()
  const account = (
    typeof account_ === 'string' ? Account.from(account_) : account_
  ) as Account.Account

  if (account.type === 'json-rpc') {
    const hash = await send(client, options_)
    const receipt = await waitForReceipt(client, {
      checkReplacement: false,
      confirmations,
      hash,
      pollingInterval,
      timeout: receiptTimeout,
    }).receipt
    if (receipt.status === 'reverted' && throwOnReceiptRevert)
      throw new TransactionReceiptRevertedError({ receipt })
    return receipt
  }

  const {
    assertChainId: _assertChainId,
    chain: chain_,
    dataSuffix = client.dataSuffix,
    kzg,
    requestOptions,
    ...rest
  } = options_

  const chain = chain_ === null ? null : (chain_ ?? client.chain)
  const codecChain = chain_ ?? client.chain
  const nonceManager =
    account.type === 'local' ? account.nonceManager : undefined
  let reset: NonceManager.NonceManager.Parameters | undefined

  try {
    const data = dataSuffix_.append(rest.data, dataSuffix)

    const to = (() => {
      if (rest.to) return rest.to
      if (rest.to === null) return undefined

      if (rest.authorizationList && rest.authorizationList.length > 0) {
        const authorization = Authorization.from(
          rest.authorizationList[0] as never,
        )
        try {
          return Secp256k1.recoverAddress({
            payload: Authorization.getSignPayload(authorization),
            signature: authorization,
          })
        } catch {
          throw new BaseError(
            '`to` is required. Could not infer from `authorizationList`.',
          )
        }
      }

      return undefined
    })()

    if (nonceManager && typeof rest.nonce === 'undefined') {
      const chainId = chain ? chain.id : await getId(client)
      reset = { address: account.address, chainId }
    }

    transactionRequest.assert(rest)

    const { request } = await prepare(client, {
      ...rest,
      account,
      chain: codecChain,
      data,
      kzg,
      nonceManager,
      parameters: [...defaultParameters, 'sidecars'],
      to,
    } as never)

    const transaction = await sign(client, {
      ...(request as object),
      account,
      chain,
      kzg,
    } as never)

    return await sendRawSync(client, {
      requestOptions,
      throwOnReceiptRevert,
      timeout,
      transaction,
    })
  } catch (err) {
    if (
      reset &&
      nonceManager &&
      !(err instanceof TransactionReceiptRevertedError)
    )
      nonceManager.reset(reset)

    if (isAbortError(err) || err instanceof TransactionReceiptRevertedError)
      throw err

    throw new RpcError.ExecutionError(err as Error, {
      ...rest,
      account,
      chain: chain ?? undefined,
    })
  }
}

export declare namespace sendSync {
  type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  > = send.Options<chain> & {
    /** Number of confirmations to wait for on JSON-RPC account sends. @default 1 */
    confirmations?: number | undefined
    /** Polling frequency in ms for JSON-RPC account sends. @default client.pollingInterval */
    pollingInterval?: number | undefined
    /** Whether to throw if the transaction receipt status is `reverted`. */
    throwOnReceiptRevert?: boolean | undefined
    /** Timeout in ms before giving up. */
    timeout?: number | undefined
  }

  type ReturnType<chain extends Chain.Chain | undefined = undefined> =
    Chain.ExtractTransactionReceipt<chain>

  type ErrorType =
    | send.ErrorType
    | sendRawSync.ErrorType
    | waitForReceipt.ErrorType
    | Account.NotFoundError
    | Account.from.ErrorType
    | Chain.assertCurrent.ErrorType
    | RpcError.ExecutionError
    | getId.ErrorType
    | Errors.GlobalErrorType
}
