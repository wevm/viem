import * as Chain from '../../core/Chain.js'

export const diode = /*#__PURE__*/ Chain.from({
  id: 15,
  name: 'Diode Prenet',
  nativeCurrency: {
    decimals: 18,
    name: 'DIODE',
    symbol: 'DIODE',
  },
  rpcUrls: {
    http: 'https://prenet.diode.io:8443',
    ws: 'wss://prenet.diode.io:8443/ws',
  },
  blockExplorers: {
    name: 'Diode Explorer',
    url: 'https://diode.io/prenet',
  },
  testnet: false,
})
