import * as Chain from '../../../core/Chain.js'

export const skaleTitan = /*#__PURE__*/ Chain.from({
  id: 1_350_216_234,
  name: 'SKALE Titan Hub',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    http: 'https://mainnet.skalenodes.com/v1/parallel-stormy-spica',
    ws: 'wss://mainnet.skalenodes.com/v1/ws/parallel-stormy-spica',
  },
  blockExplorers: {
    name: 'SKALE Explorer',
    url: 'https://parallel-stormy-spica.explorer.mainnet.skalenodes.com',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 2_076_458,
    },
  },
})
