import * as Chain from '../../core/Chain.js'

export const kinetiqElysium = /*#__PURE__*/ Chain.from({
  id: 99_901,
  name: 'Elysium',
  blockTime: 100,
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.elysium.kinetiq.xyz',
  },
  blockExplorers: {
    name: 'Elysium Explorer',
    url: 'https://elysium.kinetiq.xyz',
    apiUrl: 'https://elysium.kinetiq.xyz/api',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1343,
    },
  },
  sourceId: 999,
  testnet: false,
})
