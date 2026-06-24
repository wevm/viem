import type * as Address from 'ox/Address'
import * as Authorization from 'ox/Authorization'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'
import type * as Kzg from 'ox/Kzg'
import * as Secp256k1 from 'ox/Secp256k1'
import * as TransactionRequest from 'ox/TransactionRequest'
import { z } from 'ox/zod'

import * as Account from '../../../Account.js'
import * as Chain from '../../../Chain.js'
import type * as Client from '../../../Client.js'
import { BaseError } from '../../../Errors.js'
import * as RpcError from '../../../RpcError.js'
import type * as NonceManager from '../../../NonceManager.js'
import * as transactionRequest from '../../internal/transactionRequest.js'
import { getId } from '../chains/getId.js'
import { defaultParameters, prepare } from './prepare.js'
import { sendRaw } from './sendRaw.js'
import { sign } from './sign.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

/**
 * Creates, signs, and sends a new transaction to the network.
 *
 * - Local Accounts: signs locally, then broadcasts via `eth_sendRawTransaction`.
 * - JSON-RPC Accounts: broadcasts via `eth_sendTransaction`.
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
 * const hash = await Actions.transaction.send(client, {
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1n,
 * })
 * ```
 */
export async function send<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: send.Options<chain>,
): Promise<send.ReturnType> {
  const {
    account: account_ = client.account,
    assertChainId = true,
    chain: chain_,
    dataSuffix = client.dataSuffix,
    kzg,
    requestOptions,
    ...rest
  } = options

  if (!account_) throw new Account.NotFoundError()
  const account =
    typeof account_ === 'string' ? Account.from(account_) : account_

  const nonceManager =
    account.type === 'local' ? account.nonceManager : undefined

  // `null` opts out of the current-chain assertion; `undefined` falls back to
  // the client's chain.
  const chain = chain_ === null ? null : (chain_ ?? client.chain)
  // The chain whose codec encodes the request (the opt-out does not apply).
  const codecChain = chain_ ?? client.chain

  // Recover the address to reset the nonce against if signing/broadcasting
  // fails after the nonce manager has consumed one.
  let reset: NonceManager.NonceManager.Parameters | undefined

  try {
    const data = dataSuffix
      ? Hex.concat(rest.data ?? '0x', dataSuffix)
      : rest.data

    const to = (() => {
      // If `to` exists on the options, use that.
      if (rest.to) return rest.to

      // `to: null` is an explicit deployment transaction.
      if (rest.to === null) return undefined

      // If no `to` exists, and we are sending an EIP-7702 transaction, use the
      // address recovered from the first authorization in the list.
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

      // Otherwise, we are sending a deployment transaction.
      return undefined
    })()

    if (account.type === 'json-rpc') {
      let chainId: number | undefined
      if (chain) {
        chainId = await getId(client)
        if (assertChainId)
          Chain.assertCurrent({ chain, currentChainId: chainId })
      }

      const request = {
        ...rest,
        chainId,
        data,
        from: account.address,
        to,
      } satisfies TransactionRequest.toRpc.Input

      transactionRequest.assert(request)

      // The chain codec is an untyped `z.ZodMiniType`, so its decoded output
      // widens to `unknown`; assert back to the RPC shape it produces.
      const rpc: TransactionRequest.Rpc = codecChain?.schema?.transactionRequest
        ?.toRpc
        ? (z.decode(
            codecChain.schema.transactionRequest.toRpc,
            request,
          ) as TransactionRequest.Rpc)
        : TransactionRequest.toRpc(request)

      return (await client.request(
        { method: 'eth_sendTransaction', params: [rpc] },
        { ...requestOptions, retryCount: 0 },
      )) as Hex.Hex
    }

    // Local account: prepare → sign → broadcast.
    if (nonceManager && typeof rest.nonce === 'undefined') {
      const chainId = chain ? chain.id : await getId(client)
      reset = { address: account.address, chainId }
    }

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

    return await sendRaw(client, { requestOptions, transaction })
  } catch (err) {
    if (reset && nonceManager) nonceManager.reset(reset)

    throw new RpcError.ExecutionError(err as Error, {
      ...rest,
      account,
      chain: chain ?? undefined,
    })
  }
}

export declare namespace send {
  type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  > = Chain.ExtractTransactionRequest<chain> & {
    /** Account (or address) the transaction is sent from. @default client.account */
    account?: Account.Account | Address.Address | undefined
    /**
     * Whether to assert the Client's chain matches the connected network
     * (JSON-RPC Accounts only).
     * @default true
     */
    assertChainId?: boolean | undefined
    /**
     * Chain the transaction targets. Pass `null` to skip the current-chain
     * assertion.
     * @default client.chain
     */
    chain?: Chain.Chain | null | undefined
    /**
     * Data to append to the end of the calldata. Takes precedence over
     * `client.dataSuffix`.
     */
    dataSuffix?: Hex.Hex | undefined
    /** KZG context, used to derive blob fields from `blobs`. */
    kzg?: Kzg.Kzg | undefined
    /** Options to pass to the underlying RPC request. */
    requestOptions?: RequestOptions | undefined
  }

  type ReturnType = Hex.Hex

  type ErrorType =
    | Account.NotFoundError
    | Account.from.ErrorType
    | Chain.assertCurrent.ErrorType
    | RpcError.ExecutionError
    | getId.ErrorType
    | prepare.ErrorType
    | sign.ErrorType
    | sendRaw.ErrorType
    | transactionRequest.assert.ErrorType
    | TransactionRequest.toRpc.ErrorType
    | Errors.GlobalErrorType
}
