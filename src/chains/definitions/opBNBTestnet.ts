import { defineChain } from '../../utils/chain/defineChain.js'

export const opBNBTestnet = /*#__PURE__*/ defineChain({
  id: 5611,
  name: 'opBNB Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tBNB',
    symbol: 'tBNB',
  },
  rpcUrls: {
    default: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
  },
  blockExplorers: {
    default: {
      name: 'opbnbscan',
      url: 'https://testnet.opbnbscan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3705108,
    },
  },
  testnet: true,
})
