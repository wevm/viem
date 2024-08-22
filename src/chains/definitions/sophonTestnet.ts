import { defineChain } from '../../utils/chain/defineChain.js'

export const sophonTestnet = /*#__PURE__*/ defineChain({
  id: 531050104,
  name: 'Sophon Testnet',
  network: 'sophon',
  nativeCurrency: {
    decimals: 18,
    name: 'Sophon',
    symbol: 'SOPH',
  },
  rpcUrls: {
    public: {
      http: ['https://rpc.testnet.sophon.xyz'],
      webSocket: ['wss://rpc.testnet.sophon.xyz/ws'],
    },
    default: {
      http: ['https://rpc.testnet.sophon.xyz'],
      webSocket: ['wss://rpc.testnet.sophon.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sophon Block Explorer',
      url: 'https://explorer.testnet.sophon.xyz',
    },
  },
  testnet: true,
})
