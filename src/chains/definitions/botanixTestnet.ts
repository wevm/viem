import * as Chain from '../../core/Chain.js'

export const botanixTestnet = /*#__PURE__*/ Chain.from({
  id: 3636,
  name: 'Botanix Testnet',
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://node.botanixlabs.dev'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Botanix Testnet Explorer',
      url: 'https://testnet.botanixscan.io',
    },
  },
  testnet: true,
})
