import { defineChain } from '../../utils/chain/defineChain.js'

export const areonNetworkTestnet = /*#__PURE__*/ defineChain({
  id: 462,
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
