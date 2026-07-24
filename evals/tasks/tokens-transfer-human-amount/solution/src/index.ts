import { Actions, type Client } from 'viem'
import { mainnet } from 'viem/chains'
import type { Address } from 'viem/utils'
import { usdc } from 'viem/tokens'

export async function transferUsdc(
  client: Client.Client,
  options: transferUsdc.Options,
) {
  const { amount, to } = options
  const { receipt } = await Actions.token.transferSync(client, {
    amount: { formatted: amount },
    to,
    token: usdc(mainnet.id).address,
  })
  return receipt
}

export declare namespace transferUsdc {
  type Options = {
    amount: string
    to: Address.Address
  }
}
