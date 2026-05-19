import * as Chain from '../../core/Chain.js'

export const zkFairTestnet = /*#__PURE__*/ Chain.define({
  id: 43851n,
  name: 'ZKFair Testnet',
  network: 'zkfair-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.zkfair.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'zkFair Explorer',
      url: 'https://testnet-scan.zkfair.io',
    },
  },
  testnet: true,
})
