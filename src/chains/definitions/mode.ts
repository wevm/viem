import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

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
      name: 'Modescan',
      url: 'https://modescan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 2465882,
    },
  },
  sourceId,
})
