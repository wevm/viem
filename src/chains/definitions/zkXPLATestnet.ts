import * as Chain from '../../core/Chain.js'

export const zkXPLATestnet = /*#__PURE__*/ Chain.define({
  id: 475n,
  name: 'zkXPLA Testnet',
  network: 'zkxpla-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.zkxpla.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'zkXPLA Testnet Explorer',
      url: 'https://testnet-explorer.zkxpla.io',
      apiUrl: 'https://testnet-explorer.zkxpla.io/api',
    },
  },
  testnet: true,
})
