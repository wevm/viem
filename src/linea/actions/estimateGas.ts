import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { EstimateGasParameters as EstimateGasParameters_base } from '../../actions/public/estimateGas.js'
import {
  type PrepareTransactionRequestParameters,
  prepareTransactionRequest,
} from '../../actions/wallet/prepareTransactionRequest.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import type { BaseError } from '../../errors/base.js'
import type { GetAccountParameter } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { TransactionRequest } from '../../types/transaction.js'
import type { Filter } from '../../types/utils.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { getCallError } from '../../utils/errors/getCallError.js'
import { extract } from '../../utils/formatters/extract.js'
import { formatTransactionRequest } from '../../utils/formatters/transactionRequest.js'
import {
  type AssertRequestParameters,
  assertRequest,
} from '../../utils/transaction/assertRequest.js'
import type { LineaRpcSchema } from '../types/rpc.js'

export type EstimateGasParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = EstimateGasParameters_base<chain> & GetAccountParameter<account>

export type EstimateGasReturnType = {
  gasLimit: bigint
  baseFeePerGas: bigint
  priorityFeePerGas: bigint
}

/**
 * Estimates the gas and fees per gas necessary to complete a transaction without submitting it to the network.
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateGasParameters}
 * @returns A gas estimate and fees per gas (in wei). {@link EstimateGasReturnType}
 *
 * @example
 * import { createPublicClient, http, parseEther } from 'viem'
 * import { linea } from 'viem/chains'
 * import { estimateGas } from 'viem/linea'
 *
 * const client = createPublicClient({
 *   chain: linea,
 *   transport: http(),
 * })
 * const gasEstimate = await estimateGas(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 0n,
 * })
 */
export async function estimateGas<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  args: EstimateGasParameters<chain>,
): Promise<EstimateGasReturnType> {
  const { account: account_ = client.account } = args

  if (!account_) throw new AccountNotFoundError()
  const account = parseAccount(account_)

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

    type LineaEstimateGasSchema = Filter<
      LineaRpcSchema,
      { Method: 'linea_estimateGas' }
    >[0]
    const { baseFeePerGas, gasLimit, priorityFeePerGas } =
      await client.request<LineaEstimateGasSchema>({
        method: 'linea_estimateGas',
        params: block ? [request, block] : [request],
      })
    return {
      baseFeePerGas: BigInt(baseFeePerGas),
      gasLimit: BigInt(gasLimit),
      priorityFeePerGas: BigInt(priorityFeePerGas),
    }
  } catch (err) {
    throw getCallError(err as BaseError, {
      ...args,
      account,
      chain: client.chain,
    })
  }
}
