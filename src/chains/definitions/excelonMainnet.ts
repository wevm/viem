import * as Chain from '../../core/Chain.js'

export const excelonMainnet = /*#__PURE__*/ Chain.define({
  id: 22052002n,
  name: 'Excelon Mainnet',
  network: 'XLON',
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
