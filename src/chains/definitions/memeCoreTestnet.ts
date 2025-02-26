import { defineChain } from '../../utils/chain/defineChain.js'

export const memeCoreTestnet = /*#__PURE__*/ defineChain({
  id: 43521,
  name: 'MemeCore Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'M',
    symbol: 'M',
  },
  rpcUrls: {
    default: { 
        http: ['https://rpc.formicarium.memecore.net'],
        webSocket: ['wss://ws.formicarium.memecore.net'],
    },
  },
  blockExplorers: {
    default: { 
        name: 'MemeCoreScan',
        url: 'https://formicarium.memecorescan.io',
    },
  },
  testnet: true,
})
