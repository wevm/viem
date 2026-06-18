import * as Chain from '../../core/Chain.js'

export const zkFairTestnet = /*#__PURE__*/ Chain.from({
  id: 43851,
  name: 'ZKFair Testnet',
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
