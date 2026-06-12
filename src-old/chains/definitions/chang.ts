import { defineChain } from '../../utils/chain/defineChain.js'

export const chang = /*#__PURE__*/ defineChain({
  id: 5858,
  name: 'Chang Chain Foundation Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CTH',
    symbol: 'CTH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.cthscan.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chang Chain explorer',
      url: 'https://cthscan.com',
    },
  },
})
