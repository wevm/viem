import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { WalletGetCallsReceiptReturnType } from '../../types/eip1193.js'
import type { Prettify } from '../../types/utils.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { receiptStatuses } from '../../utils/formatters/transactionReceipt.js'

export type GetCallsReceiptParameters = { id: string }

export type GetCallsReceiptReturnType = Prettify<
  WalletGetCallsReceiptReturnType<bigint, 'success' | 'reverted'>
>

export type GetCallsReceiptErrorType = RequestErrorType | ErrorType

/**
 * Returns the status of a call batch that was sent via `sendCalls`.
 *
 * - Docs: https://viem.sh/experimental/actions/getCallsReceipt
 * - JSON-RPC Methods: [`wallet_getCallsReceipt`](https://eips.ethereum.org/EIPS/eip-5792)
 *
 * @param client - Client to use
 * @returns Status of the calls. {@link GetCallsReceiptReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getCallsReceipt } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const { receipts, status } = await getCallsReceipt(client, { id: '0xdeadbeef' })
 */
export async function getCallsReceipt<
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetCallsReceiptParameters,
): Promise<GetCallsReceiptReturnType> {
  const { id } = parameters
  const { receipts, status } = await client.request({
    method: 'wallet_getCallsReceipt',
    params: id,
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
