import * as Chain from '../../core/Chain.js'

export const zkXPLA = /*#__PURE__*/ Chain.from({
  id: 375,
  name: 'zkXPLA Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.zkxpla.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'zkXPLA Mainnet Explorer',
      url: 'https://explorer.zkxpla.io',
      apiUrl: 'https://explorer.zkxpla.io/api',
    },
  },
  testnet: false,
})
