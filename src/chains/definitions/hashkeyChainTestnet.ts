import { defineChain } from '../../utils/chain/defineChain.js'

export const hashkeyTestnet = /*#__PURE__*/ defineChain({
  id: 133,
  name: 'HSKChain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HashKey Platform Token',
    symbol: 'HSK',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hsk.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HSKChain Testnet explorer',
      url: 'https://testnet-explorer.hskchain.net',
    },
  },
  testnet: true,
})
