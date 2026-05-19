import * as Chain from '../../core/Chain.js'

export const nautilus = /*#__PURE__*/ Chain.define({
  id: 22222n,
  name: 'Nautilus Mainnet',
  nativeCurrency: { name: 'ZBC', symbol: 'ZBC', decimals: 9 },
  rpcUrls: {
    default: {
      http: ['https://api.nautilus.nautchain.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'NautScan',
      url: 'https://nautscan.com',
    },
  },
})
