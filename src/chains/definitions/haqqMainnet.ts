import * as Chain from '../../core/Chain.js'

export const haqqMainnet = /*#__PURE__*/ Chain.define({
  id: 11235n,
  name: 'HAQQ Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Islamic Coin',
    symbol: 'ISLM',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.eth.haqq.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HAQQ Explorer',
      url: 'https://explorer.haqq.network',
      apiUrl: 'https://explorer.haqq.network/api',
    },
  },
})
