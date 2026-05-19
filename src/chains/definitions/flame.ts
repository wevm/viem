import * as Chain from '../../core/Chain.js'

export const flame = /*#__PURE__*/ Chain.define({
  id: 253368190n,
  name: 'Flame',
  network: 'flame',
  nativeCurrency: {
    symbol: 'TIA',
    name: 'TIA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.flame.astria.org'],
      webSocket: ['wss://ws.flame.astria.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Flame Explorer',
      url: 'https://explorer.flame.astria.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 6829148,
    },
  },
})
