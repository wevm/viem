import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import {
  type PrepareTransactionRequestParameters,
  prepareTransactionRequest,
} from '../../actions/wallet/prepareTransactionRequest.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseError } from '../../errors/base.js'
import type { EstimateGasParameters } from '../../index.js'
import type { Chain } from '../../types/chain.js'
import type { TransactionRequest } from '../../types/transaction.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { extract } from '../../utils/formatters/extract.js'
import { formatTransactionRequest } from '../../utils/formatters/transactionRequest.js'
import { getCallError } from '../../utils/index.js'
import {
  type AssertRequestParameters,
  assertRequest,
} from '../../utils/transaction/assertRequest.js'
import type { LineaEstimateGasReturnType } from '../types/fee.js'
import type { LineaEstimateGasRpcSchema } from '../types/rpc.js'

/**
 * Estimates the gas, gas fee per gas and priority fee per gas necessary to complete a transaction without submitting it to the network.
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateGasParameters}
 * @returns An estimate (in wei) for the base fee per gas, the priority fee per gas and the gas limit. {@link LineaEstimateGasReturnType}
 *
 * @example
 * import { createPublicClient, http, parseEther } from 'viem'
 * import { lineaTestnet } from 'viem/chains'
 * import { lineaEstimateGas } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: lineaTestnet,
 *   transport: http(),
 * })
 * const gasEstimate = await lineaEstimateGas(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 0n,
 * })
 */
export async function lineaEstimateGas<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  args: EstimateGasParameters<TChain>,
): Promise<LineaEstimateGasReturnType> {
  const account_ = args.account ?? client.account
  const account = account_ ? parseAccount(account_) : undefined

  try {
    const {
      accessList,
      blockNumber,
      blockTag,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
      ...rest
    } =
      account?.type === 'local'
        ? ((await prepareTransactionRequest(
            client,
            args as PrepareTransactionRequestParameters,
          )) as EstimateGasParameters)
        : args

    const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined
    const block = blockNumberHex || blockTag

    assertRequest(args as AssertRequestParameters)

    const chainFormat = client.chain?.formatters?.transactionRequest?.format
    const format = chainFormat || formatTransactionRequest

    const request = format({
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
      from: account?.address,
      accessList,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
    } as TransactionRequest)

    return await client.request<LineaEstimateGasRpcSchema>({
      method: 'linea_estimateGas',
      params: block ? [request, block] : [request],
    })
  } catch (err) {
    throw getCallError(err as BaseError, {
      ...args,
      account,
      chain: client.chain,
    })
  }
}
