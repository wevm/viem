import type { Client } from 'viem'
import { Actions } from 'viem/tempo'

export async function createToken(
  client: Client.Client,
  options: createToken.Options,
) {
  const { name, symbol } = options
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name,
    symbol,
  })
  const metadata = await Actions.token.getMetadata(client, { token })
  return { metadata, token }
}

export declare namespace createToken {
  type Options = {
    name: string
    symbol: string
  }
}
