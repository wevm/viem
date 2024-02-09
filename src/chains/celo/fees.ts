import { estimateFeesPerGas } from "~viem/actions/public/estimateFeesPerGas.js"
import type { Client } from '~viem/clients/createClient.js'
import { type Address, type ChainFees, type Hex } from "~viem/index.js"

import { formatters } from "./formatters.js"


export const fees = {
  estimateFeesPerGas: async (params) => {
    // When using token to pay for fees, we need to estimate the fees in the value of the token
    if (params.request?.feeCurrency) {

      const [ maxFeePerGas, maxPriorityFeePerGas] = await Promise.all([
        estimateFeePerGasInFeeCurrency(params.client, params.request.feeCurrency),
        estimateMaxPriorityFeePerGasInFeeCurrency(params.client, params.request.feeCurrency)
      ])

      return {
        maxFeePerGas,
        maxPriorityFeePerGas
      }
    }

    return estimateFeesPerGas(params.client, params)
  }

} satisfies ChainFees<typeof formatters>


type RequestGasPriceInFeeCurrencyParams = {
  Method: 'eth_gasPrice';
  Parameters: [Address];
  ReturnType: Hex;
}



async function estimateFeePerGasInFeeCurrency(client: Client, feeCurrency: Address) {
  const fee = await client.request<RequestGasPriceInFeeCurrencyParams>({
    method: 'eth_gasPrice',
    params: [feeCurrency],
  })
  return BigInt(fee)
}

type RequestMaxGasPriceInFeeCurrencyParams = {
  Method: 'eth_maxPriorityFeePerGas';
  Parameters: [Address];
  ReturnType: Hex;
}

async function estimateMaxPriorityFeePerGasInFeeCurrency(client: Client, feeCurrency: Address) {
  const feesPerGas = await client.request<RequestMaxGasPriceInFeeCurrencyParams>({
    method: 'eth_maxPriorityFeePerGas',
    params: [feeCurrency],
  })
  return BigInt(feesPerGas)
}
