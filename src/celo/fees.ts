import { getCode } from '../actions/public/getCode.js'
import type { Client } from '../clients/createClient.js'
import type {
  Address,
  ChainEstimateFeesPerGasFnParameters,
  ChainFees,
  Hex,
} from '../index.js'
import type { formatters } from './formatters.js'

export const fees: ChainFees<typeof formatters> = {
  /*
   * Estimates the fees per gas for a transaction.

   * If the transaction is to be paid in a token (feeCurrency is present) then the fees 
   * are estimated in the value of the token. Otherwise falls back to the default
   * estimation by returning null.
   * 
   * @param params fee estimation function parameters
   */
  estimateFeesPerGas: async (
    params: ChainEstimateFeesPerGasFnParameters<typeof formatters>,
  ) => {
    if (!params.request?.feeCurrency) return null

    const [gasPrice, maxPriorityFeePerGas, cel2] = await Promise.all([
      estimateFeePerGasInFeeCurrency(params.client, params.request.feeCurrency),
      estimateMaxPriorityFeePerGasInFeeCurrency(
        params.client,
        params.request.feeCurrency,
      ),
      isCel2(params.client),
    ])

    const maxFeePerGas = cel2
      ? // eth_gasPrice for cel2 returns baseFeePerGas + maxPriorityFeePerGas
        params.multiply(gasPrice - maxPriorityFeePerGas) + maxPriorityFeePerGas
      : // eth_gasPrice for Celo L1 returns (baseFeePerGas * multiplier), where the multiplier is 2 by default.
        gasPrice + maxPriorityFeePerGas

    return {
      maxFeePerGas,
      maxPriorityFeePerGas,
    }
  },
}

type RequestGasPriceInFeeCurrencyParams = {
  Method: 'eth_gasPrice'
  Parameters: [Address]
  ReturnType: Hex
}

/*
 * Estimate the fee per gas in the value of the fee token

 *
 * @param client - Client to use
 * @param feeCurrency -  Address of a whitelisted fee token
 * @returns The fee per gas in wei in the value of the  fee token
 *
 */
async function estimateFeePerGasInFeeCurrency(
  client: Client,
  feeCurrency: Address,
) {
  const fee = await client.request<RequestGasPriceInFeeCurrencyParams>({
    method: 'eth_gasPrice',
    params: [feeCurrency],
  })
  return BigInt(fee)
}

type RequestMaxGasPriceInFeeCurrencyParams = {
  Method: 'eth_maxPriorityFeePerGas'
  Parameters: [Address]
  ReturnType: Hex
}

/*
 * Estimate the max priority fee per gas in the value of the fee token

 *
 * @param client - Client to use
 * @param feeCurrency -  Address of a whitelisted fee token
 * @returns The fee per gas in wei in the value of the  fee token
 *
 */
async function estimateMaxPriorityFeePerGasInFeeCurrency(
  client: Client,
  feeCurrency: Address,
) {
  const feesPerGas =
    await client.request<RequestMaxGasPriceInFeeCurrencyParams>({
      method: 'eth_maxPriorityFeePerGas',
      params: [feeCurrency],
    })
  return BigInt(feesPerGas)
}

async function isCel2(client: Client) {
  const proxyAdminAddress = '0x4200000000000000000000000000000000000018'
  const code = await getCode(client, { address: proxyAdminAddress })
  return Boolean(code)
}
