import { defineChain } from '../../utils/chain/defineChain.js'

export const pharosTestnet = /*#__PURE__*/ defineChain({
  id: 688688,
  name: 'Pharos Testnet',
  nativeCurrency: { name: 'Pharos', symbol: 'PHRS', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.dplabs-internal.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Pharos Testnet Explorer',
      url: 'https://testnet.pharosscan.xyz',
      apiUrl: 'https://api.pharosnetwork.xyz',
    },
  },
  testnet: true,
})
