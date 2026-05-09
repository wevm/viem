import { defineChain } from '../../utils/chain/defineChain.js'

export const bearNetworkChainMainnet = /*#__PURE__*/ defineChain({
  id: 641230,
  name: 'Bear Network Chain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BearNetworkChain',
    symbol: 'BRNKC',
  },
  rpcUrls: {
    default: { http: ['https://brnkc-mainnet.bearnetwork.net'] },
  },
  blockExplorers: {
    default: {
      name: 'BrnkScan',
      url: 'https://brnkscan.bearnetwork.net',
      apiUrl: 'https://brnkscan.bearnetwork.net/api',
    },
  },
})
