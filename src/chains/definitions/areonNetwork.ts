import { defineChain } from '../../utils/chain/defineChain.js'

export const areonNetwork = /*#__PURE__*/ defineChain({
  id: 463,
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
