import * as Chain from '../../core/Chain.js'

export const hyveChain = /*#__PURE__*/ Chain.from({
  id: 7847,
  name: 'HyveChain',
  nativeCurrency: { name: 'HYVE', symbol: 'HYVE', decimals: 18 },
  rpcUrls: {
    http: ['https://rpc.hyvechain.com'],
    ws: ['wss://ws.hyvechain.com'],
  },
  blockExplorers: {
    name: 'HyveChain Explorer',
    url: 'https://explorer.hyvechain.com',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 4090846,
    },
  },
  testnet: false,
})
