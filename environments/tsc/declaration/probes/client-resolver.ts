import { Client, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'

export const resolver = Client.createResolver({
  chains: [mainnet, optimism],
  transport: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
  },
})
