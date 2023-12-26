import { defineChain } from '../../utils/chain/defineChain.js'

export const zkFairTestnet = /*#__PURE__*/ defineChain({
  id: 43851,
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
    public: {
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
