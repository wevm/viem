import { Hex, TransactionReceipt } from 'ox'
import type { Errors } from 'ox'

import type * as Capabilities from '../../Capabilities.js'
import type * as Client from '../../Client.js'
import type { Compute } from '../../internal/types.js'
import {
  fallbackMagicIdentifier,
  fallbackTransactionErrorMagicIdentifier,
} from './sendCalls.js'

type RpcReceipt = {
  blockHash: Hex.Hex
  blockNumber: Hex.Hex
  gasUsed: Hex.Hex
  logs: readonly {
    address: Hex.Hex
    data: Hex.Hex
    topics: readonly Hex.Hex[]
  }[]
  status: Hex.Hex
  transactionHash: Hex.Hex
}

/**
 * Returns the status of a call batch that was sent via `sendCalls`.
 *
 * @example
 * ```ts
 * import { Actions, Client, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: custom(window.ethereum!),
 * })
 * const { receipts, status } = await Actions.wallet.getCallsStatus(client, {
 *   id: '0xdeadbeef',
 * })
 * ```
 */
export async function getCallsStatus(
  client: Client.Client,
  options: getCallsStatus.Options,
): Promise<getCallsStatus.ReturnType> {
  async function getStatus(id: Hex.Hex) {
    const isTransactions = id.endsWith(fallbackMagicIdentifier.slice(2))
    if (isTransactions) {
      const chainId = Hex.trimLeft(Hex.slice(id, -64, -32))
      const hashes = Hex.slice(id, 0, -64)
        .slice(2)
        .match(/.{1,64}/g)

      const receipts = await Promise.all(
        hashes!.map((hash) =>
          fallbackTransactionErrorMagicIdentifier.slice(2) !== hash
            ? client.request(
                {
                  method: 'eth_getTransactionReceipt',
                  params: [`0x${hash}`],
                },
                { dedupe: true },
              )
            : undefined,
        ),
      )

      const status = (() => {
        if (receipts.some((r) => r === null)) return 100 // pending
        if (receipts.every((r) => r?.status === '0x1')) return 200 // success
        if (receipts.every((r) => r?.status === '0x0')) return 500 // complete failure
        return 600 // partial failure
      })()

      return {
        atomic: false,
        chainId: Hex.toNumber(chainId),
        receipts: receipts.filter(Boolean) as readonly RpcReceipt[],
        status,
        version: '2.0.0',
      }
    }
    return client.request({
      method: 'wallet_getCallsStatus',
      params: [id],
    })
  }

  const {
    atomic = false,
    chainId,
    receipts,
    version = '2.0.0',
    ...response
  } = (await getStatus(options.id as Hex.Hex)) as {
    atomic?: boolean | undefined
    chainId?: number | Hex.Hex | undefined
    receipts?: readonly RpcReceipt[] | undefined
    status: number
    version?: string | undefined
    capabilities?:
      | Capabilities.Extract<'getCallsStatus', 'ReturnType'>
      | undefined
    id?: string | undefined
  }

  const [status, statusCode] = (() => {
    const statusCode = response.status
    if (statusCode >= 100 && statusCode < 200)
      return ['pending', statusCode] as const
    if (statusCode >= 200 && statusCode < 300)
      return ['success', statusCode] as const
    if (statusCode >= 300 && statusCode < 700)
      return ['failure', statusCode] as const
    // For backwards compatibility.
    if ((statusCode as unknown) === 'CONFIRMED')
      return ['success', 200] as const
    if ((statusCode as unknown) === 'PENDING') return ['pending', 100] as const
    return [undefined, statusCode] as const
  })()

  return {
    ...response,
    atomic,
    chainId: typeof chainId === 'string' ? Hex.toNumber(chainId) : chainId,
    receipts:
      receipts?.map((receipt) => ({
        ...receipt,
        blockNumber: Hex.toBigInt(receipt.blockNumber),
        gasUsed: Hex.toBigInt(receipt.gasUsed),
        status:
          TransactionReceipt.fromRpcStatus[receipt.status as '0x0' | '0x1'],
      })) ?? [],
    statusCode,
    status,
    version,
  } as getCallsStatus.ReturnType
}

export declare namespace getCallsStatus {
  type Options = {
    /** Identifier of the call batch. */
    id: string
  }

  type Receipt = {
    blockHash: Hex.Hex
    blockNumber: bigint
    gasUsed: bigint
    logs: readonly {
      address: Hex.Hex
      data: Hex.Hex
      topics: readonly Hex.Hex[]
    }[]
    status: 'success' | 'reverted'
    transactionHash: Hex.Hex
  }

  type ReturnType = Compute<{
    atomic: boolean
    capabilities?:
      | Capabilities.Extract<'getCallsStatus', 'ReturnType'>
      | undefined
    chainId: number | undefined
    id: string
    receipts: readonly Receipt[]
    status: 'pending' | 'success' | 'failure' | undefined
    statusCode: number
    version: string
  }>

  type ErrorType = Errors.GlobalErrorType
}
