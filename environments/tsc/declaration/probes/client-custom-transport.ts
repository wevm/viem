// wevm/viem#554 class: an EIP-1193 `custom` transport client leaked provider request
// types.
import { Client, custom } from 'viem'
import { mainnet } from 'viem/chains'

declare const provider: { request(args: unknown): Promise<unknown> }

export const client = Client.create({
  chain: mainnet,
  transport: custom(provider),
})
