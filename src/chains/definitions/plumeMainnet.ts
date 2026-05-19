import * as Chain from '../../core/Chain.js'

const sourceId = 1n // ethereum

export const plumeMainnet = /*#__PURE__*/ Chain.define({
  id: 98_866n,
  name: 'Plume',
  nativeCurrency: {
    name: 'Plume',
    symbol: 'PLUME',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.plume.org'],
      webSocket: ['wss://rpc.plume.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.plume.org',
      apiUrl: 'https://explorer.plume.org/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 39_679,
    },
  },
  sourceId,
})
