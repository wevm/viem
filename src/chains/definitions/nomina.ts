import * as Chain from '../../core/Chain.js'

export const nomina = /*#__PURE__*/ Chain.from({
  id: 166,
  name: 'Nomina',
  nativeCurrency: {
    name: 'Nomina',
    symbol: 'NOM',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://mainnet.nomina.io',
    ws: 'wss://mainnet.nomina.io',
  },
  blockExplorers: {
    name: 'Nomina Explorer',
    url: 'https://nomscan.io',
  },
  testnet: false,
})
