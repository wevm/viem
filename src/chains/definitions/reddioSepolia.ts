import * as Chain from '../../core/Chain.js'

export const reddioSepolia = /*#__PURE__*/ Chain.define({
  id: 50341n,
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
