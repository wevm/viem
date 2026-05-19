import * as Chain from '../../core/Chain.js'

export const rootPorcini = /*#__PURE__*/ Chain.define({
  id: 7672n,
  name: 'The Root Network - Porcini',
  nativeCurrency: {
    decimals: 18,
    name: 'XRP',
    symbol: 'XRP',
  },
  rpcUrls: {
    default: {
      http: ['https://porcini.rootnet.app/archive'],
      webSocket: ['wss://porcini.rootnet.app/archive/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Rootscan',
      url: 'https://porcini.rootscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xc9C2E2429AeC354916c476B30d729deDdC94988d',
      blockCreated: 10555692,
    },
  },
  testnet: true,
})
