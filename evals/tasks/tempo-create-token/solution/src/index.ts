import { Account, Actions, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

const client = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const { token: firstToken } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'Orbital USD',
    symbol: 'OUSD',
  })
  const firstMetadata = await Actions.token.getMetadata(client, {
    token: firstToken,
  })
  const { token: secondToken } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'Harbor USD',
    symbol: 'HUSD',
  })
  const secondMetadata = await Actions.token.getMetadata(client, {
    token: secondToken,
  })
  return {
    first: { metadata: firstMetadata, token: firstToken },
    second: { metadata: secondMetadata, token: secondToken },
  }
}
