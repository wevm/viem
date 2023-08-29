import { defineChain } from '../../utils/chain.js'

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
      address: '0xBB9759009cDaC82774EfC84D94cD9F7440f75Fcf',
      blockCreated: 23_499_787,
    },
  },
})
