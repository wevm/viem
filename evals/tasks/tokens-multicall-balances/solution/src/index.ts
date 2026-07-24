import { Actions, type Client } from 'viem'
import { mainnet } from 'viem/chains'
import type { Address } from 'viem/utils'
import { usdc } from 'viem/tokens'

export async function getUsdcBalances(
  client: Client.Client,
  options: getUsdcBalances.Options,
): Promise<readonly [bigint, bigint, bigint]> {
  const [a, b, c] = options.accounts
  const token = usdc(mainnet.id).address
  const { results } = await Actions.multicall(client, {
    allowFailure: false,
    calls: [
      Actions.token.getBalance.call(client, { account: a, token }),
      Actions.token.getBalance.call(client, { account: b, token }),
      Actions.token.getBalance.call(client, { account: c, token }),
    ],
  })
  return results
}

export declare namespace getUsdcBalances {
  type Options = {
    accounts: readonly [Address.Address, Address.Address, Address.Address]
  }
}
