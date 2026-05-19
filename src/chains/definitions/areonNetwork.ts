import * as Chain from '../../core/Chain.js'

export const areonNetwork = /*#__PURE__*/ Chain.define({
  id: 463n,
  name: 'Areon Network',
  nativeCurrency: { decimals: 18, name: 'AREA', symbol: 'AREA' },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.areon.network'],
      webSocket: ['wss://mainnet-ws.areon.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Areonscan',
      url: 'https://areonscan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 353286,
    },
  },
  testnet: false,
})
