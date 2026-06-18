import * as Chain from '../../core/Chain.js'

export const reddioSepolia = /*#__PURE__*/ Chain.from({
  id: 50341,
  name: 'Reddio Sepolia',
  nativeCurrency: { name: 'Reddio', symbol: 'RED', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://reddio-dev.reddio.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Reddioscan',
      url: 'https://reddio-devnet.l2scan.co',
      apiUrl: 'https://reddio-devnet.l2scan.co/api',
    },
  },
  testnet: true,
})
