import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 42_161 // Arbitrum One

export const apeChain = /*#__PURE__*/ defineChain({
  id: 33139,
  name: 'ApeChain',
  nativeCurrency: {
    name: 'ApeCoin',
    symbol: 'APE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.apechain.com/http'],
      webSocket: ['wss://rpc.apechain.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Apescan',
      url: 'https://apescan.io',
      apiUrl: 'https://api.apescan.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 20889,
    },
  },
  sourceId,
})
