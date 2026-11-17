import * as Chain from '../../core/Chain.js'

export const ynxTestnet = /*#__PURE__*/ Chain.from({
  id: 6_423,
  name: 'YNX Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'YNXT',
    symbol: 'YNXT',
  },
  rpcUrls: { http: 'https://evm.ynxweb4.com' },
  blockExplorers: {
    name: 'YNX Explorer',
    url: 'https://explorer.ynxweb4.com',
  },
  testnet: true,
})
