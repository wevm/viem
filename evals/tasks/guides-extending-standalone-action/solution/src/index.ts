import {
  type Account,
  Actions,
  type Chain,
  type Client,
  type Token,
  type Transport,
} from 'viem'
import type { Address } from 'viem/utils'

export async function getAccountSummary(
  client: Client.Client,
  options: getAccountSummary.Options,
): Promise<getAccountSummary.ReturnType> {
  const [balance, nonce] = await Promise.all([
    Actions.address.getBalance(client, options),
    Actions.address.getTransactionCount(client, options),
  ])
  return { balance, nonce }
}

export declare namespace getAccountSummary {
  type Options = { address: Address.Address }
  type ReturnType = { balance: bigint; nonce: number }
}

export function extendAppClient<
  const chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  transport extends Transport.Transport,
  tokens extends Token.Tokens | undefined,
>(client: Client.Client<chain, account, transport, tokens>) {
  return client.extend((client) => ({
    accounts: {
      getSummary: (options: getAccountSummary.Options) =>
        getAccountSummary(client, options),
    },
  }))
}
