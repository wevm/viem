import * as Chain from '../../core/Chain.js'

export const plasma = /*#__PURE__*/ Chain.from({
  id: 9745,
  name: 'Plasma',
  blockTime: 1000,
  nativeCurrency: {
    name: 'Plasma',
    symbol: 'XPL',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.plasma.to',
  },
  blockExplorers: {
    name: 'PlasmaScan',
    url: 'https://plasmascan.to',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
})
