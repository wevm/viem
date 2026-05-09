import { defineChain } from '../../utils/chain/defineChain.js'

export const nexi = /*#__PURE__*/ defineChain({
  id: 4242,
  name: 'Nexi',
  nativeCurrency: { name: 'Nexi', symbol: 'NEXI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.chain.nexi.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'NexiScan',
      url: 'https://www.nexiscan.com',
      apiUrl: 'https://www.nexiscan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0x0277A46Cc69A57eE3A6C8c158bA874832F718B8E',
      blockCreated: 25770160,
    },
  },
})
