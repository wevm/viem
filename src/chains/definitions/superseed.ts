import { defineChain } from '../../utils/chain/defineChain.js'

export const superseed = /*#__PURE__*/ defineChain({
  id: 5330,
  name: 'Superseed',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.superseed.xyz'],
      webSocket: ['wss://mainnet.superseed.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Superseed Explorer',
      url: 'https://explorer.superseed.xyz',
    },
  },
  testnet: false,
})
