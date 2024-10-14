import type { Client } from '../clients/createClient.js'
import type {
  Address,
  ChainEstimateFeesPerGasFnParameters,
  ChainFees,
  Hex,
} from '../index.js'
import type { formatters } from './formatters.js'

type RequestGetCodeParams = {
  Method: 'eth_getCode'
  Parameters: [Address, 'latest']
  ReturnType: Hex
}
/*
 * This checks if we're in L2 context, it's a port of the technique used in
 * https://github.com/celo-org/celo-monorepo/blob/da9b4955c1fdc8631980dc4adf9b05e0524fc228/packages/protocol/contracts-0.8/common/IsL2Check.sol#L17
 */
const isCel2 = async (client: Client) => {
  const proxyAdminAddress = '0x4200000000000000000000000000000000000018'
  const code = await client.request<RequestGetCodeParams>({
    method: 'eth_getCode',
    params: [proxyAdminAddress, 'latest'],
  })
  if (typeof code === 'string') {
    return code !== '0x' && code.length > 2
  }
  return false
}

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

    const [gasPrice, maxPriorityFeePerGas] = await Promise.all([
      estimateFeePerGasInFeeCurrency(params.client, params.request.feeCurrency),
      estimateMaxPriorityFeePerGasInFeeCurrency(
        params.client,
        params.request.feeCurrency,
      ),
    ])

    let maxFeePerGas: bigint;
    if (await isCel2(params.client)) {
      // eth_gasPrice for cel2 returns baseFeePerGas + maxPriorityFeePerGas
      maxFeePerGas =
        params.multiply(gasPrice - maxPriorityFeePerGas) + maxPriorityFeePerGas
    } else {
      // eth_gasPrice for Celo L1 returns (baseFeePerGas * multiplier), where the multiplier is 2 by default.
      maxFeePerGas = gasPrice + maxPriorityFeePerGas
    }

    return {
      maxFeePerGas: maxFeePerGas,
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
