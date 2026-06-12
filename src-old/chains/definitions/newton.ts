import { defineChain } from '../../utils/chain/defineChain.js'

export const newton = /*#__PURE__*/ defineChain({
  id: 1012,
  name: 'Newton',
  nativeCurrency: {
    name: 'Newton',
    symbol: 'NEW',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://global.rpc.mainnet.newtonproject.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'NewFi explorer',
      url: 'https://explorer.newtonproject.org/',
    },
  },
  testnet: false,
})
