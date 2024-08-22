import { defineChain } from '../../utils/chain/defineChain.js'

export const botanixTestnet = /*#__PURE__*/ defineChain({
  id: 3636,
  name: 'Botanix Testnet',
  nativeCurrency: { name: 'Botanix', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://poa-node.botanixlabs.dev'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://blockscout.botanixlabs.dev',
      apiUrl: 'https://blockscout.botanixlabs.dev',
    },
  },
  testnet: true,
})
