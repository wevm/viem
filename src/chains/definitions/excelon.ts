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
      webSocket: ['wss://build.onbeam.com/ws'],
      webSocket: ['???????????????? DO WE HAVE ONE ???????'],
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
      address: '???????????????? DO WE HAVE ONE ???????',
      blockCreated: 1,
    },
  },
})
