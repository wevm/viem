import { defineChain } from '../../utils/chain/defineChain.js'

export const evolveTestnet = /*#__PURE__*/ defineChain({
  id: 94797,
  name: 'EVOLVE Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'EVOLVE',
    symbol: 'EVOLVE',
  },
  rpcUrls: {
    default: { http: ['https://subnets.avax.network/evolve/testnet/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'EVOLVE Explorer',
      url: 'https://explorer-test.avax.network/evolve',
    },
  },
  testnet: true,
})
