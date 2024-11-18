import { defineChain } from '../../utils/chain/defineChain.js'

export const vanar = /*#__PURE__*/ defineChain({
  id: 2040,
  name: 'Vanar Mainnet',
  nativeCurrency: { name: 'VANRY', symbol: 'VANRY', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.vanarchain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Vanar Mainnet Explorer',
      url: 'https://explorer.vanarchain.com/',
    },
  },
  testnet: false,
})
