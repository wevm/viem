import { defineChain } from '../../utils/chain/defineChain.js'

export const opBNB = /*#__PURE__*/ defineChain({
  id: 204,
  name: 'opBNB',
  network: 'opBNB Mainnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    public: { http: ['https://opbnb-mainnet-rpc.bnbchain.org'] },
    default: { http: ['https://opbnb-mainnet-rpc.bnbchain.org'] },
  },
  blockExplorers: {
    default: { name: 'opbnbscan', url: 'https://mainnet.opbnbscan.com' },
  },

  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 512881,
    },
  },
})
