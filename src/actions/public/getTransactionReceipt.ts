import type { PublicClient, Transport } from '../../clients/index.js'
import { TransactionReceiptNotFoundError } from '../../errors/index.js'
import type { Chain, Hash } from '../../types/index.js'
import { format } from '../../utils/index.js'
import type {
  FormattedTransactionReceipt,
  TransactionReceiptFormatter,
} from '../../utils/formatters/transactionReceipt.js'
import { formatTransactionReceipt } from '../../utils/formatters/transactionReceipt.js'

export type GetTransactionReceiptParameters = {
  /** The hash of the transaction. */
  hash: Hash
}

export type GetTransactionReceiptReturnType<
  TChain extends Chain | undefined = Chain | undefined,
> = FormattedTransactionReceipt<TransactionReceiptFormatter<TChain>>

/**
 * Returns the [Transaction Receipt](https://viem.sh/docs/glossary/terms#transaction-receipt) given a [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash.
 *
 * - Docs: https://viem.sh/docs/actions/public/getTransactionReceipt.html
 * - Example: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/transactions/fetching-transactions
 * - JSON-RPC Methods: [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionReceipt)
 *
 * @param client - Client to use
 * @param parameters - {@link GetTransactionReceiptParameters}
 * @returns The transaction receipt. {@link GetTransactionReceiptReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getTransactionReceipt } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const transactionReceipt = await getTransactionReceipt(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 */
export async function getTransactionReceipt<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  { hash }: GetTransactionReceiptParameters,
) {
  const receipt = await client.request({
    method: 'eth_getTransactionReceipt',
    params: [hash],
  })

  if (!receipt) throw new TransactionReceiptNotFoundError({ hash })

  return format(receipt, {
    formatter:
      client.chain?.formatters?.transactionReceipt || formatTransactionReceipt,
  }) as GetTransactionReceiptReturnType<TChain>
}
