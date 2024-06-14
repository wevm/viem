import { defineChain } from '../../utils/chain/defineChain.js'

export const thaiChain = /*#__PURE__*/ defineChain({
  id: 7,
  name: 'ThaiChain',
  nativeCurrency: { name: 'TCH', symbol: 'TCH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.thaichain.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://exp.thaichain.org',
      apiUrl: 'https://exp.thaichain.org/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0x0DaD6130e832c21719C5CE3bae93454E16A84826',
      blockCreated: 4806386,
    },
  },
  testnet: false,
})
