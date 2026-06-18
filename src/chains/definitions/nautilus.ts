import * as Chain from '../../core/Chain.js'

export const nautilus = /*#__PURE__*/ Chain.from({
  id: 22222,
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
