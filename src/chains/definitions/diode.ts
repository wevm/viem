import { defineChain } from '../../utils/chain/defineChain.js'

export const diode = /*#__PURE__*/ defineChain({
  id: 15,
  name: 'Diode Prenet',
  nativeCurrency: {
    decimals: 18,
    name: 'DIODE',
    symbol: 'DIODE',
  },
  rpcUrls: {
    default: {
      http: ['https://prenet.diode.io:8443'],
      webSocket: ['wss://prenet.diode.io:8443/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Diode Explorer',
      url: 'https://diode.io/prenet',
    },
  },
  testnet: false,
})
