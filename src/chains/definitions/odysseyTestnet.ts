import * as Chain from '../../core/Chain.js'

export const odysseyTestnet = /*#__PURE__*/ Chain.define({
  id: 911867n,
  name: 'Odyssey Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://odyssey.ithaca.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Odyssey Explorer',
      url: 'https://odyssey-explorer.ithaca.xyz',
      apiUrl: 'https://odyssey-explorer.ithaca.xyz/api',
    },
  },
  testnet: true,
})
