import { defineChain } from '../../utils/chain/defineChain.js'

export const excelonMainnet = /*#__PURE__*/ defineChain({
  id: 22052002,
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
