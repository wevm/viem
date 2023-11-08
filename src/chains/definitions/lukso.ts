import { defineChain } from '../../utils/chain/defineChain.js'

export const lukso = /*#__PURE__*/ defineChain({
  id: 42,
  network: 'lukso',
  name: 'LUKSO Mainnet',
  nativeCurrency: {
    name: 'LUKSO',
    symbol: 'LYX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.lukso.network'],
      webSocket: ['wss://ws-rpc.mainnet.lukso.network'],
    },
    public: {
      http: ['https://rpc.mainnet.lukso.network'],
      webSocket: ['wss://ws-rpc.mainnet.lukso.network'],
    },
    gateway: {
      http: ['https://rpc.lukso.gateway.fm'],
    },
    nownodes: {
      http: ['https://lukso.nownodes.io'],
    },
    thirdweb: {
      http: ['https://lukso.rpc.thirdweb.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LUKSO Mainnet Explorer',
      url: 'https://explorer.execution.mainnet.lukso.network'.
    },
  },
})
