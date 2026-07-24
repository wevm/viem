import { type Account, Actions, type Client, Token, type Transport } from 'viem'
import { mainnet } from 'viem/chains'
import type { Address } from 'viem/utils'

export function defineVusd(options: defineVusd.Options) {
  return Token.from({
    addresses: { 1: options.tokenAddress },
    currency: 'USD',
    decimals: 6,
    name: 'Vault USD',
    symbol: 'VUSD',
  })
}

export declare namespace defineVusd {
  type Options = {
    tokenAddress: Address.Address
  }

  type Definition = ReturnType<typeof defineVusd>
}

export async function getTokenBalance<
  const client extends Client.Client<
    typeof mainnet,
    Account.Account | undefined,
    Transport.Transport,
    readonly [defineVusd.Definition]
  >,
>(client: client, options: getTokenBalance.Options) {
  return Actions.token.getBalance(client, {
    account: options.holder,
    token: 'vusd',
  })
}

export declare namespace getTokenBalance {
  type Options = {
    holder: Address.Address
  }
}
