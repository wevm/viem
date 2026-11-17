import * as Chain from '../../core/Chain.js'

export const worldLand = /*#__PURE__*/ Chain.from({
  id: 103,
  name: 'WorldLand Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'WLC',
    symbol: 'WLC',
  },
  rpcUrls: {
    http: 'https://seoul.worldland.foundation',
  },
  blockExplorers: {
    name: 'WorldLand Scan',
    url: 'https://scan.worldland.foundation',
  },
  testnet: false,
})
