import * as Chain from '../../core/Chain.js'

export const excelonMainnet = /*#__PURE__*/ Chain.from({
  id: 22052002,
  name: 'Excelon Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Excelon',
    symbol: 'xlon',
  },
  rpcUrls: {
    default: {
      http: ['https://edgewallet1.xlon.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Excelon explorer',
      url: 'https://explorer.excelon.io',
    },
  },
})
