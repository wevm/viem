import { defineChain } from '../../utils/chain.js'

export const holesky = /*#__PURE__*/ defineChain({
  id: 17000,
  network: 'holesky',
  name: 'Holesky',
  nativeCurrency: { name: 'Holesky Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.holesky.ethpandaops.io'],
    },
    public: {
      http: ['https://rpc.holesky.ethpandaops.io'],
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 77,
    },
  },
  testnet: true,
})
