import * as Chain from '../../core/Chain.js'

export const worldLand = /*#__PURE__*/ Chain.define({
  id: 103n,
  name: 'WorldLand Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'WLC',
    symbol: 'WLC',
  },
  rpcUrls: {
    default: {
      http: ['https://seoul.worldland.foundation'],
    },
  },
  blockExplorers: {
    default: {
      name: 'WorldLand Scan',
      url: 'https://scan.worldland.foundation',
    },
  },
  testnet: false,
})
