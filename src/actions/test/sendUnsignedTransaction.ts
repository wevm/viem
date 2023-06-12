import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type { Formatter } from '../../types/formatter.js'
import type { Hash } from '../../types/misc.js'
import type { TransactionRequest } from '../../types/transaction.js'
import type { MergeIntersectionProperties } from '../../types/utils.js'
import { extract } from '../../utils/formatters/extract.js'
import { type Formatted, format } from '../../utils/formatters/format.js'
import {
  type TransactionRequestFormatter,
  formatTransactionRequest,
} from '../../utils/formatters/transactionRequest.js'

type FormattedTransactionRequest<
  TFormatter extends Formatter | undefined = Formatter,
> = MergeIntersectionProperties<
  Formatted<TFormatter, TransactionRequest, true>,
  TransactionRequest
>

export type SendUnsignedTransactionParameters<
  TChain extends Chain | undefined = Chain | undefined,
> = FormattedTransactionRequest<TransactionRequestFormatter<TChain>>

export type SendUnsignedTransactionReturnType = Hash

/**
 * Returns the details of all transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only.
 *
 * - Docs: https://viem.sh/docs/actions/test/getTxpoolContent.html
 *
 * @param client - Client to use
 * @param parameters – {@link SendUnsignedTransactionParameters}
 * @returns The transaction hash. {@link SendUnsignedTransactionReturnType}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { sendUnsignedTransaction } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * const hash = await sendUnsignedTransaction(client, {
 *   from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 */
export async function sendUnsignedTransaction<
  TChain extends Chain | undefined,
>(
  client: TestClient<TestClientMode, Transport, TChain>,
  args: SendUnsignedTransactionParameters<TChain>,
): Promise<SendUnsignedTransactionReturnType> {
  const {
    accessList,
    data,
    from,
    gas,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    to,
    value,
    ...rest
  } = args

  const formatter = client.chain?.formatters?.transactionRequest
  const request = format(
    {
      accessList,
      data,
      from,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { formatter }),
    } as TransactionRequest,
    {
      formatter: formatter || formatTransactionRequest,
    },
  )
  const hash = await client.request({
    method: 'eth_sendUnsignedTransaction',
    params: [request],
  })
  return hash
}
