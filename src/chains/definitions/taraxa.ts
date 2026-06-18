import * as Chain from '../../core/Chain.js'

export const taraxa = /*#__PURE__*/ Chain.from({
  id: 841,
  name: 'Taraxa Mainnet',
  nativeCurrency: { name: 'Tara', symbol: 'TARA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.taraxa.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Taraxa Explorer',
      url: 'https://explorer.mainnet.taraxa.io',
    },
  },
})
