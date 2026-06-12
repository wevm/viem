import { defineChain } from '../../utils/chain/defineChain.js'

export const nomina = /*#__PURE__*/ defineChain({
  id: 166,
  name: 'Nomina',
  nativeCurrency: {
    name: 'Nomina',
    symbol: 'NOM',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.nomina.io'],
      webSocket: ['wss://mainnet.nomina.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Nomina Explorer',
      url: 'https://nomscan.io',
    },
  },
  testnet: false,
})
