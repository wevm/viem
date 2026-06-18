import * as Chain from '../../core/Chain.js'

export const ubiq = /*#__PURE__*/ Chain.from({
  id: 8,
  name: 'Ubiq Mainnet',
  nativeCurrency: { name: 'UBQ', symbol: 'UBQ', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://pyrus2.ubiqscan.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ubiq Scan',
      url: 'https://ubiqscan.io',
    },
  },
  testnet: false,
})
