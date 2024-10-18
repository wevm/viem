import { defineChain } from '../../utils/chain/defineChain.js'

export const beam = /*#__PURE__*/ defineChain({
  id: 22052002,
  name: 'Excelon Mainnet',
  network: 'XLON',
  nativeCurrency: {
    decimals: 18,
    name: 'Excelon',
    symbol: 'xlon',
  },
  rpcUrls: {
    default: {
      http: ['http://wallet2.xlon.org:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Excelon explorer',
      url: 'https://explorer.excelon.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xf2c7a98199f73f8903bd7ac58a3bfb94f0a5515a',
      blockCreated: 21177998,
    },
  },
})
