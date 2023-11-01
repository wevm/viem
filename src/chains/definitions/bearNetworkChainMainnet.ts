import { defineChain } from '../../utils/chain/defineChain.js'

export const bearNetworkChainMainnet = /*#__PURE__*/ defineChain({
  id: 641230,
  name: 'Bear Network Chain Mainnet',
  network: 'BearNetworkChainMainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BearNetworkChain',
    symbol: 'BRNKC',
  },
  rpcUrls: {
    public: { http: ['https://brnkc-mainnet.bearnetwork.net'] },
    default: { http: ['https://brnkc-mainnet.bearnetwork.net'] },
  },
  blockExplorers: {
    default: { name: 'BrnkScan', url: 'https://brnkscan.bearnetwork.net' },
  },
})
