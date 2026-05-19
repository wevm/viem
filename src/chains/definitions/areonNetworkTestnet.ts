import * as Chain from '../../core/Chain.js'

export const areonNetworkTestnet = /*#__PURE__*/ Chain.define({
  id: 462n,
  name: 'Areon Network Testnet',
  nativeCurrency: { decimals: 18, name: 'TAREA', symbol: 'TAREA' },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.areon.network'],
      webSocket: ['wss://testnet-ws.areon.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Areonscan',
      url: 'https://areonscan.com',
    },
  },
  testnet: true,
})
