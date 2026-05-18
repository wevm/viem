import { defineChain } from '../../utils/chain/defineChain.js'

export const curtis = /*#__PURE__*/ defineChain({
  id: 33_111,
  name: 'Curtis',
  nativeCurrency: { name: 'ApeCoin', symbol: 'APE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.curtis.apechain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Curtis Explorer',
      url: 'https://explorer.curtis.apechain.com',
    },
  },
  testnet: true,
})
