import * as Chain from '../../core/Chain.js'

export const omax = /*#__PURE__*/ Chain.define({
  id: 311n,
  name: 'Omax Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OMAX',
    symbol: 'OMAX',
  },
  rpcUrls: {
    default: { http: ['https://mainapi.omaxray.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Omax Explorer',
      url: 'https://omaxscan.com',
    },
  },
  testnet: false,
})
