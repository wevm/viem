import * as Chain from '../../core/Chain.js'

export const rootPorcini = /*#__PURE__*/ Chain.from({
  id: 7672,
  name: 'The Root Network - Porcini',
  nativeCurrency: {
    decimals: 18,
    name: 'XRP',
    symbol: 'XRP',
  },
  rpcUrls: {
    http: 'https://porcini.rootnet.app/archive',
    ws: 'wss://porcini.rootnet.app/archive/ws',
  },
  blockExplorers: {
    name: 'Rootscan',
    url: 'https://porcini.rootscan.io',
  },
  contracts: {
    multicall3: {
      address: '0xc9C2E2429AeC354916c476B30d729deDdC94988d',
      blockCreated: 10555692,
    },
  },
  testnet: true,
})
