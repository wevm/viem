import { defineChain } from '../../utils/chain/defineChain.js'

export const odysseyTestnet = /*#__PURE__*/ defineChain({
  id: 911867,
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
