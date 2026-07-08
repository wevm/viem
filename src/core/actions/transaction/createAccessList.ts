import { Hex, TransactionRequest } from 'ox'
import type { AccessList, Address, Block, Errors } from 'ox'

import type * as Account from '../../Account.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import * as RpcError from '../../RpcError.js'
import { isAbortError } from '../../internal/errors.js'
import { blockParameter } from '../internal/blockParameter.js'
import * as transactionRequest from '../internal/transactionRequest.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

/**
 * Creates an EIP-2930 access list covering the storage a transaction touches
 * (`eth_createAccessList`).
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
 * const { accessList, gasUsed } = await Actions.transaction.createAccessList(
 *   client,
 *   {
 *     data: '0x06fdde03',
 *     to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   },
 * )
 * ```
 */
export async function createAccessList(
  client: Client.Client,
  options: createAccessList.Options = {},
): Promise<createAccessList.ReturnType> {
  const {
    account: account_ = client.account,
    blockNumber,
    blockTag = client.blockTag ?? 'latest',
    requestOptions,
    ...rest
  } = options

  const from = account_
    ? typeof account_ === 'string'
      ? account_
      : account_.address
    : rest.from

  try {
    const request = {
      ...rest,
      from,
    } satisfies TransactionRequest.toRpc.Input

    transactionRequest.assert(request)

    const block = blockParameter({ blockNumber, blockTag })

    type Response = {
      accessList: AccessList.AccessList
      error?: string | undefined
      gasUsed: Hex.Hex
    }
    const response = (await client.request(
      {
        method: 'eth_createAccessList',
        params: [
          TransactionRequest.toRpc(request),
          typeof block === 'bigint' ? Hex.fromNumber(block) : block,
        ],
      },
      requestOptions,
    )) as Response

    if (response.error)
      throw new BaseError(response.error, { details: response.error })

    return {
      accessList: response.accessList,
      gasUsed: Hex.toBigInt(response.gasUsed),
    }
  } catch (err) {
    if (isAbortError(err)) throw err

    throw new RpcError.ExecutionError(err as Error, {
      ...rest,
      chain: client.chain,
      from,
    })
  }
}

export declare namespace createAccessList {
  type Options = Omit<TransactionRequest.toRpc.Input, 'accessList'> & {
    /** Account (or address) attached to the call (`msg.sender`). */
    account?: Account.Account | Address.Address | undefined
    /** Per-request transport options (signal, dedupe, …). */
    requestOptions?: RequestOptions
  } & (
      | {
          /** The block number to create the access list at. */
          blockNumber?: bigint | undefined
          blockTag?: undefined
        }
      | {
          blockNumber?: undefined
          /** The block tag to create the access list at. @default 'latest' */
          blockTag?: Block.Tag | undefined
        }
    )

  type ReturnType = {
    /** EIP-2930 access list covering the storage the call touches. */
    accessList: AccessList.AccessList
    /** Gas consumed by the call with the access list applied. */
    gasUsed: bigint
  }

  type ErrorType = RpcError.ExecutionError | Errors.GlobalErrorType
}
