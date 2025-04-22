import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type {
  WalletCapabilities,
  WalletGetCallsStatusReturnType,
} from '../../types/eip1193.js'
import type { Prettify } from '../../types/utils.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { hexToBigInt, hexToNumber } from '../../utils/encoding/fromHex.js'
import { receiptStatuses } from '../../utils/formatters/transactionReceipt.js'

export type GetCallsStatusParameters = { id: string }

export type GetCallsStatusReturnType = Prettify<
  Omit<
    WalletGetCallsStatusReturnType<
      WalletCapabilities,
      number,
      bigint,
      'success' | 'reverted'
    >,
    'status'
  > & {
    statusCode: number
    status: 'pending' | 'success' | 'failure' | undefined
  }
>

export type GetCallsStatusErrorType = RequestErrorType | ErrorType

/**
 * Returns the status of a call batch that was sent via `sendCalls`.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/getCallsStatus
 * - JSON-RPC Methods: [`wallet_getCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
 *
 * @param client - Client to use
 * @returns Status of the calls. {@link GetCallsStatusReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getCallsStatus } from 'viem/actions'
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
  const {
    atomic = false,
    chainId,
    receipts,
    version = '2.0.0',
    ...response
  } = await client.request({
    method: 'wallet_getCallsStatus',
    params: [parameters.id],
  })
  const [status, statusCode] = (() => {
    const statusCode = response.status
    if (statusCode >= 100 && statusCode < 200)
      return ['pending', statusCode] as const
    if (statusCode >= 200 && statusCode < 300)
      return ['success', statusCode] as const
    if (statusCode >= 300 && statusCode < 700)
      return ['failure', statusCode] as const
    // @ts-expect-error: for backwards compatibility
    if (statusCode === 'CONFIRMED') return ['success', 200] as const
    // @ts-expect-error: for backwards compatibility
    if (statusCode === 'PENDING') return ['pending', 100] as const
    return [undefined, statusCode]
  })()
  return {
    ...response,
    atomic,
    // @ts-expect-error: for backwards compatibility
    chainId: chainId ? hexToNumber(chainId) : undefined,
    receipts:
      receipts?.map((receipt) => ({
        ...receipt,
        blockNumber: hexToBigInt(receipt.blockNumber),
        gasUsed: hexToBigInt(receipt.gasUsed),
        status: receiptStatuses[receipt.status as '0x0' | '0x1'],
      })) ?? [],
    statusCode,
    status,
    version,
  }
}
