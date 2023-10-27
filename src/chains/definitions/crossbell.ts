import { defineChain } from '../../utils/chain/defineChain.js'

export const crossbell = /*#__PURE__*/ defineChain({
  id: 3_737,
  network: 'crossbell',
  name: 'Crossbell',
  nativeCurrency: {
    decimals: 18,
    name: 'CSB',
    symbol: 'CSB',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.crossbell.io'],
    },
    public: {
      http: ['https://rpc.crossbell.io'],
    },
  },
  blockExplorers: {
    default: { name: 'CrossScan', url: 'https://scan.crossbell.io' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 38_246_031,
    },
  },
})
