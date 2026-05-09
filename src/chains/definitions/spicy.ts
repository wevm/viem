import { defineChain } from '../../utils/chain/defineChain.js'

export const spicy = /*#__PURE__*/ defineChain({
  id: 88_882,
  name: 'Chiliz Spicy Testnet',
  network: 'chiliz-spicy-Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    default: {
      http: [
        'https://spicy-rpc.chiliz.com',
        'https://chiliz-spicy-rpc.publicnode.com',
      ],
      webSocket: [
        'wss://spicy-rpc-ws.chiliz.com',
        'wss://chiliz-spicy-rpc.publicnode.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliz Explorer',
      url: 'http://spicy-explorer.chiliz.com',
      apiUrl: 'http://spicy-explorer.chiliz.com/api',
    },
  },
  testnet: true,
})
