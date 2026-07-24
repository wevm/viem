import { Actions, type Client } from 'viem'
import { mainnet } from 'viem/chains'
import type { Address } from 'viem/utils'
import { usdc } from 'viem/tokens'

export function getUsdcAddress(): Address.Address {
  return usdc(mainnet.id).address
}

export async function getUsdcMetadata(client: Client.Client) {
  return Actions.token.getMetadata(client, { token: getUsdcAddress() })
}
