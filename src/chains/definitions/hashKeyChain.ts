import { defineChain } from '../../utils/chain/defineChain.js'

export const hashkey = /*#__PURE__*/ defineChain({
  id: 177,
  name: 'HSKChain',
  nativeCurrency: {
    decimals: 18,
    name: 'HashKey Platform Token',
    symbol: 'HSK',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.hsk.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HSKChain Explorer',
      url: 'https://hsk.blockscout.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
})
