import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { WalletGetCallsStatusReturnType } from '../../../types/eip1193.js'
import type { Prettify } from '../../../types/utils.js'
import type { RequestErrorType } from '../../../utils/buildRequest.js'
import { hexToBigInt } from '../../../utils/encoding/fromHex.js'
import { receiptStatuses } from '../../../utils/formatters/transactionReceipt.js'

export type GetCallsStatusParameters = { id: string }

export type GetCallsStatusReturnType = Prettify<
  WalletGetCallsStatusReturnType<bigint, 'success' | 'reverted'>
>

export type GetCallsStatusErrorType = RequestErrorType | ErrorType

/**
 * Returns the status of a call batch that was sent via `sendCalls`.
 *
 * - Docs: https://viem.sh/experimental/eip5792/getCallsStatus
 * - JSON-RPC Methods: [`wallet_getCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
 *
 * @param client - Client to use
 * @returns Status of the calls. {@link GetCallsStatusReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getCallsStatus } from 'viem/experimental'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const { receipts, status } = await getCallsStatus(client, { id: '0xdeadbeef' })
 */
export async function getCallsStatus<
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetCallsStatusParameters,
): Promise<GetCallsStatusReturnType> {
  const { id } = parameters
  const { receipts, status } = await client.request({
    method: 'wallet_getCallsStatus',
    params: [id],
  })
  return {
    status,
    receipts:
      receipts?.map((receipt) => ({
        ...receipt,
        blockNumber: hexToBigInt(receipt.blockNumber),
        gasUsed: hexToBigInt(receipt.gasUsed),
        status: receiptStatuses[receipt.status as '0x0' | '0x1'],
      })) ?? [],
  }
}
