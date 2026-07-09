import {
  Authorization,
  Blobs,
  Hex,
  Secp256k1,
  StateOverrides,
  TransactionRequest,
} from 'ox'
import type { Address, Errors, Kzg } from 'ox'

import type * as Account from '../../Account.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import * as RpcError from '../../RpcError.js'
import { isAbortError } from '../../internal/errors.js'
import { blockParameter } from '../internal/blockParameter.js'
import * as transactionRequest from '../internal/transactionRequest.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

/**
 * Estimates the gas necessary to complete a transaction without submitting it
 * to the network (`eth_estimateGas`).
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const gas = await Actions.transaction.estimateGas(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1n,
 * })
 * ```
 */
export async function estimateGas(
  client: Client.Client,
  options: estimateGas.Options = {},
): Promise<estimateGas.ReturnType> {
  const {
    account: account_ = client.account,
    blockHash,
    blockNumber,
    blockTag = client.blockTag ?? 'latest',
    kzg,
    requestOptions,
    requireCanonical,
    stateOverride,
    ...rest
  } = options

  const from = account_
    ? typeof account_ === 'string'
      ? account_
      : account_.address
    : rest.from

  try {
    const to = (() => {
      // If `to` exists on the parameters, use that.
      if (rest.to) return rest.to

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
            '`to` is required. Could not infer from `authorizationList`',
          )
        }
      }

      // Otherwise, we are sending a deployment transaction.
      return undefined
    })()

    // Some RPC Providers do not compute versioned hashes from blobs. Derive
    // them locally when missing.
    const blobVersionedHashes =
      rest.blobVersionedHashes ??
      (rest.blobs && kzg
        ? Blobs.toVersionedHashes(rest.blobs as readonly Hex.Hex[], {
            as: 'Hex',
            kzg,
          })
        : undefined)

    const request = {
      ...rest,
      blobVersionedHashes,
      data: rest.data ?? rest.input,
      from,
      input: undefined,
      to,
    } satisfies TransactionRequest.toRpc.Input

    transactionRequest.assert(request)

    const block = blockParameter({
      blockHash,
      blockNumber,
      blockTag,
      requireCanonical,
    })

    const toRpc = client.chain?.schema?.transactionRequest?.toRpc
    // Chain converters are untyped; assert back to the RPC shape produced.
    const request_ = toRpc
      ? (toRpc(request) as TransactionRequest.Rpc)
      : TransactionRequest.toRpc(request)

    return Hex.toBigInt(
      await client.request(
        {
          method: 'eth_estimateGas',
          params: stateOverride
            ? [request_, block, StateOverrides.toRpc(stateOverride)]
            : [request_, block],
        },
        requestOptions,
      ),
    )
  } catch (err) {
    if (isAbortError(err)) throw err

    throw new RpcError.ExecutionError(err as Error, {
      ...rest,
      chain: client.chain,
      from,
    })
  }
}

export declare namespace estimateGas {
  type Options = TransactionRequest.toRpc.Input & {
    /** Account (or address) the transaction is sent from. */
    account?: Account.Account | Address.Address | undefined
    /** KZG context, used to derive blob versioned hashes from `blobs`. */
    kzg?: Kzg.Kzg | undefined
    /** Per-request transport options (signal, dedupe, …). */
    requestOptions?: RequestOptions
    /** State overrides for the gas estimation. */
    stateOverride?: StateOverrides.StateOverrides | undefined
  } & blockParameter.BlockOptions

  type ReturnType = bigint

  type ErrorType = RpcError.ExecutionError | Errors.GlobalErrorType
}
