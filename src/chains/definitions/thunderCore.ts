import { defineChain } from '../../utils/chain/defineChain.js'

export const thunderCore = /*#__PURE__*/ defineChain({
  id: 108,
  name: 'ThunderCore Mainnet',
  nativeCurrency: { name: 'TT', symbol: 'TT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.thundercore.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ThunderCore Explorer',
      url: 'https://viewblock.io/thundercore',
    },
  },
  testnet: false,
})
