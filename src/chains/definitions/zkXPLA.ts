import * as Chain from '../../core/Chain.js'

export const zkXPLA = /*#__PURE__*/ Chain.define({
  id: 375n,
  name: 'zkXPLA Mainnet',
  network: 'zkxpla',
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
