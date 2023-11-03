import { defineChain } from '../../utils/chain/defineChain.js'

export const astar = /*#__PURE__*/ defineChain({
  id: 592,
  name: 'Astar',
  network: 'astar-mainnet',
  nativeCurrency: {
    name: 'Astar',
    symbol: 'ASTR',
    decimals: 18,
  },
  rpcUrls: {
    public: { http: ['https://astar.api.onfinality.io/public'] },
    default: { http: ['https://astar.api.onfinality.io/public'] },
  },
  blockExplorers: {
    default: { name: 'Astar Subscan', url: 'https://astar.subscan.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 761794,
    },
  },
  testnet: false,
})
