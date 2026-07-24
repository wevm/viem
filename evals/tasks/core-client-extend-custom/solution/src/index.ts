import {
  type Account,
  Actions,
  type Chain,
  type Client,
  publicActions,
  type Token,
  type Transport,
} from 'viem'

export function extendAppClient<
  const chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  transport extends Transport.Transport,
  tokens extends Token.Tokens | undefined,
>(client: Client.Client<chain, account, transport, tokens>) {
  return client.extend(publicActions()).extend((client) => ({
    health: {
      async check() {
        const [blockNumber, chainId] = await Promise.all([
          Actions.block.getNumber(client),
          Actions.chains.getId(client),
        ])
        return { blockNumber, chainId }
      },
    },
  }))
}
