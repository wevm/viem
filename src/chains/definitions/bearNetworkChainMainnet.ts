import * as Chain from '../../core/Chain.js'

export const bearNetworkChainMainnet = /*#__PURE__*/ Chain.from({
  id: 641230,
  name: 'Bear Network Chain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BearNetworkChain',
    symbol: 'BRNKC',
  },
  rpcUrls: { http: 'https://brnkc-mainnet.bearnetwork.net' },
  blockExplorers: {
    name: 'BrnkScan',
    url: 'https://brnkscan.bearnetwork.net',
    apiUrl: 'https://brnkscan.bearnetwork.net/api',
  },
})
