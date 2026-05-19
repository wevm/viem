import * as Chain from '../../core/Chain.js'

export const chang = /*#__PURE__*/ Chain.define({
  id: 5858n,
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
