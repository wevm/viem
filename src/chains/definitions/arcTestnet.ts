import { defineChain } from '../../utils/chain/defineChain.js'

export const arcTestnet = /*#__PURE__*/ defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.testnet.arc.io',
        'https://rpc.blockdaemon.testnet.arc.io',
        'https://rpc.drpc.testnet.arc.io',
        'https://rpc.quicknode.testnet.arc.io',
      ],
      webSocket: [
        'wss://rpc.testnet.arc.io',
        'wss://rpc.blockdaemon.testnet.arc.io:443/websocket',
        'wss://rpc.drpc.testnet.arc.io',
        'wss://rpc.quicknode.testnet.arc.io',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arc Explorer',
      url: 'https://explorer.testnet.arc.io',
      apiUrl: 'https://explorer.testnet.arc.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: true,
})
