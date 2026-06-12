import { defineChain } from '../../utils/chain/defineChain.js'

export const nahmii = /*#__PURE__*/ defineChain({
  id: 5551,
  name: 'Nahmii 2 Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://l2.nahmii.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Nahmii 2 Explorer',
      url: 'https://explorer.n2.nahmii.io',
    },
  },
  testnet: false,
})
