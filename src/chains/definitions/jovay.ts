import { defineChain } from '../../utils/chain/defineChain.js'

export const jovay = /*#__PURE__*/ defineChain({
  id: 5_734_951,
  name: 'Jovay Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://api.zan.top/public/jovay-mainnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Jovay Explorer',
      url: 'https://explorer.jovay.io',
    },
  },
  testnet: false,
})
