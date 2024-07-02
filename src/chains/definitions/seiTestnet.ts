import { defineChain } from '../../utils/chain/defineChain.js'

export const seiTestnet = /*#__PURE__*/ defineChain({
  id: 1328,
  name: 'Sei Testnet',
  nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evm-rpc-testnet.sei-apis.com'],
      webSocket: ['wss://evm-ws-testnet.sei-apis.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Seitrace',
      url: 'https://seitrace.com',
    },
  },
  testnet: true,
})
