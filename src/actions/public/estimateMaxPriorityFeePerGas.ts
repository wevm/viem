import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import {
  Eip1559FeesNotSupportedError,
  type Eip1559FeesNotSupportedErrorType,
} from '../../errors/fee.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Block } from '../../types/block.js'
import type { Chain, ChainFeesFnParameters } from '../../types/chain.js'
import type { GetChainParameter } from '../../types/chain.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type HexToBigIntErrorType,
  hexToBigInt,
} from '../../utils/encoding/fromHex.js'
import { getAction } from '../../utils/getAction.js'
import type { PrepareTransactionRequestParameters } from '../wallet/prepareTransactionRequest.js'
import { type GetBlockErrorType, getBlock } from './getBlock.js'
import { type GetGasPriceErrorType, getGasPrice } from './getGasPrice.js'

export type EstimateMaxPriorityFeePerGasParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
> = GetChainParameter<chain, chainOverride>

export type EstimateMaxPriorityFeePerGasReturnType = bigint

export type EstimateMaxPriorityFeePerGasErrorType =
  | GetBlockErrorType
  | HexToBigIntErrorType
  | RequestErrorType
  | GetBlockErrorType
  | GetGasPriceErrorType
  | Eip1559FeesNotSupportedErrorType
  | ErrorType

/**
 * Returns an estimate for the max priority fee per gas (in wei) for a
 * transaction to be likely included in the next block.
 * Defaults to [`chain.fees.defaultPriorityFee`](/docs/clients/chains#fees-defaultpriorityfee) if set.
 *
 * - Docs: https://viem.sh/docs/actions/public/estimateMaxPriorityFeePerGas
 *
 * @param client - Client to use
 * @returns An estimate (in wei) for the max priority fee per gas. {@link EstimateMaxPriorityFeePerGasReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { estimateMaxPriorityFeePerGas } from 'viem/actions'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const maxPriorityFeePerGas = await estimateMaxPriorityFeePerGas(client)
 * // 10000000n
 */
export async function estimateMaxPriorityFeePerGas<
  chain extends Chain | undefined,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain>,
  args?: EstimateMaxPriorityFeePerGasParameters<chain, chainOverride>,
): Promise<EstimateMaxPriorityFeePerGasReturnType> {
  return internal_estimateMaxPriorityFeePerGas(client, args as any)
}

export async function internal_estimateMaxPriorityFeePerGas<
  chain extends Chain | undefined,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain>,
  args: EstimateMaxPriorityFeePerGasParameters<chain, chainOverride> & {
    block?: Block
    request?: PrepareTransactionRequestParameters<
      chain,
      Account | undefined,
      chainOverride
    >
  },
): Promise<EstimateMaxPriorityFeePerGasReturnType> {
  const { block: block_, chain = client.chain, request } = args || {}
  if (typeof chain?.fees?.defaultPriorityFee === 'function') {
    const block = block_ || (await getAction(client, getBlock, 'getBlock')({}))
    return chain.fees.defaultPriorityFee({
      block,
      client,
      request,
    } as ChainFeesFnParameters)
  }

  if (typeof chain?.fees?.defaultPriorityFee !== 'undefined')
    return chain?.fees?.defaultPriorityFee

  try {
    const maxPriorityFeePerGasHex = await client.request({
      method: 'eth_maxPriorityFeePerGas',
    })
    return hexToBigInt(maxPriorityFeePerGasHex)
  } catch {
    // If the RPC Provider does not support `eth_maxPriorityFeePerGas`
    // fall back to calculating it manually via `gasPrice - baseFeePerGas`.
    // See: https://github.com/ethereum/pm/issues/328#:~:text=eth_maxPriorityFeePerGas%20after%20London%20will%20effectively%20return%20eth_gasPrice%20%2D%20baseFee
    const [block, gasPrice] = await Promise.all([
      block_
        ? Promise.resolve(block_)
        : getAction(client, getBlock, 'getBlock')({}),
      getAction(client, getGasPrice, 'getGasPrice')({}),
    ])

    if (typeof block.baseFeePerGas !== 'bigint')
      throw new Eip1559FeesNotSupportedError()

    const maxPriorityFeePerGas = gasPrice - block.baseFeePerGas

    if (maxPriorityFeePerGas < 0n) return 0n
    return maxPriorityFeePerGas
  }
}
