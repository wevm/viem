import { defineChain } from '../../utils/chain/defineChain.js'

export const hyveChain = /*#__PURE__*/ defineChain({
  id: 7847,
  name: 'HyveChain',
  nativeCurrency: { name: 'HYVE', symbol: 'HYVE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyvechain.com'],
      webSocket: ['wss://ws.hyvechain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HyveChain Explorer',
      url: 'https://explorer.hyvechain.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 4090846,
    },
  },
  testnet: false,
})
