import { defineChain } from '../../utils/chain/defineChain.js'

export const lukso = /*#__PURE__*/ defineChain({
  id: 42,
  network: 'lukso',
  name: 'LUKSO',
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
  },
  blockExplorers: {
    default: {
      name: 'LUKSO Mainnet Explorer',
      url: 'https://explorer.execution.mainnet.lukso.network',
      apiUrl: 'https://api.explorer.execution.mainnet.lukso.network/api',
    },
  },
})
