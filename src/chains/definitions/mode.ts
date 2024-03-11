import { defineChain } from '../../utils/chain/defineChain.js'

export const mode = /*#__PURE__*/ defineChain({
  id: 34443,
  name: 'Mode Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.mode.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mode Explorer',
      url: 'https://explorer.mode.network',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 2465882,
    },
  },
})
