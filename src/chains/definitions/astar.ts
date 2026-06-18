import * as Chain from '../../core/Chain.js'

export const astar = /*#__PURE__*/ Chain.from({
  id: 592,
  name: 'Astar',
  nativeCurrency: {
    name: 'Astar',
    symbol: 'ASTR',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://astar.api.onfinality.io/public'] },
  },
  blockExplorers: {
    default: {
      name: 'Astar Subscan',
      url: 'https://astar.subscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 761794,
    },
  },
  testnet: false,
})
