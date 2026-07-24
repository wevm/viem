import { Actions, type Client } from 'viem'
import { Abis, type Address } from 'viem/utils'

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

export async function getUsdcSummary(
  client: Client.Client,
  options: getUsdcSummary.Options,
) {
  return getTokenSummaryStrict(client, { owner: options.owner, token: usdc })
}

export async function getTokenSummaryStrict(
  client: Client.Client,
  options: getTokenSummaryStrict.Options,
) {
  const { owner, token } = options
  const { results } = await Actions.multicall(client, {
    allowFailure: false,
    calls: [
      { abi: Abis.erc20, functionName: 'name', to: token },
      { abi: Abis.erc20, functionName: 'symbol', to: token },
      { abi: Abis.erc20, functionName: 'decimals', to: token },
      { abi: Abis.erc20, args: [owner], functionName: 'balanceOf', to: token },
    ],
  })
  const [name, symbol, decimals, balance] = results
  return { balance, decimals, name, symbol }
}

export declare namespace getUsdcSummary {
  type Options = {
    owner: Address.Address
  }
}

export declare namespace getTokenSummaryStrict {
  type Options = {
    owner: Address.Address
    token: Address.Address
  }
}
