import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { TransactionRequest } from '../../types/transaction.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { extract } from '../../utils/formatters/extract.js'
import {
  type FormattedTransactionRequest,
  formatTransactionRequest,
} from '../../utils/formatters/transactionRequest.js'

export type SendUnsignedTransactionParameters<
  chain extends Chain | undefined = Chain | undefined,
> = FormattedTransactionRequest<chain>

export type SendUnsignedTransactionReturnType = Hash

export type SendUnsignedTransactionErrorType = RequestErrorType | ErrorType

/**
 * Executes a transaction regardless of the signature.
 *
 * - Docs: https://viem.sh/docs/actions/test/sendUnsignedTransaction#sendunsignedtransaction
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
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: TestClient<TestClientMode, Transport, chain, account, false>,
  args: SendUnsignedTransactionParameters<chain>,
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

  const chainFormat = client.chain?.formatters?.transactionRequest?.format
  const format = chainFormat || formatTransactionRequest

  const request = format(
    {
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
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
    } as TransactionRequest,
    'sendUnsignedTransaction',
  )
  const hash = await client.request({
    method: 'eth_sendUnsignedTransaction',
    params: [request],
  })
  return hash
}
