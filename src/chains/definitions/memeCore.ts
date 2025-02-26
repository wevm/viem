import { defineChain } from '../../utils/chain/defineChain.js'

export const memeCore = /*#__PURE__*/ defineChain({
  id: 4352,
  name: 'MemeCore',
  nativeCurrency: {
    decimals: 18,
    name: 'M',
    symbol: 'M',
  },
  rpcUrls: {
    default: { 
        http: ['https://rpc.memecore.net'],
        webSocket: ['wss://ws.memecore.net'],
    },
  },
  blockExplorers: {
    default: { 
        name: 'MemeCoreScan',
        url: 'https://memecorescan.io',
    },
  },
  testnet: false,
})
