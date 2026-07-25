import { mainnet } from 'viem/chains'

export function example() {
  return mainnet.extend({
    contracts: {
      ...mainnet.contracts,
      registry: {
        address: '0x000000000000000000000000000000000000c0dE',
      },
    },
  })
}
