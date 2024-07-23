import { defineChain } from '../../utils/chain/defineChain.js'

export const rootPorcini = /*#__PURE__*/ defineChain({
  id: 7672,
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
    ensRegistry: { address: '0xA931c1F9621ECa562c258B81bF9fA8401f12241B' },
    ensUniversalResolver: {
      address: '0xB3c0AE882b35E72B7b84F7A1E0cF01fBDC617170',
      blockCreated: 11_983_898,
    },
  },
  testnet: true,
})
