import * as Chain from '../../core/Chain.js'

const sourceId = 1 // ethereum

export const plumeMainnet = /*#__PURE__*/ Chain.from({
  id: 98_866,
  name: 'Plume',
  nativeCurrency: {
    name: 'Plume',
    symbol: 'PLUME',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.plume.org',
    ws: 'wss://rpc.plume.org',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://explorer.plume.org',
    apiUrl: 'https://explorer.plume.org/api',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 39_679,
    },
  },
  sourceId,
})
