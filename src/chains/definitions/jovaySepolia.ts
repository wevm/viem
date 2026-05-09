import { defineChain } from '../../utils/chain/defineChain.js'

export const jovaySepolia = /*#__PURE__*/ defineChain({
  id: 2_019_775,
  name: 'Jovay Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://api.zan.top/public/jovay-testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Jovay Testnet Explorer',
      url: 'https://sepolia-explorer.jovay.io/l2',
    },
  },
  testnet: true,
})
