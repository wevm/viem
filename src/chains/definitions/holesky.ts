import { defineChain } from '../../utils/chain/defineChain.js'

export const holesky = /*#__PURE__*/ defineChain({
  id: 17000,
  network: 'holesky',
  name: 'Holesky',
  nativeCurrency: { name: 'Holesky Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://ethereum-holesky.publicnode.com'],
    },
    public: {
      http: ['https://ethereum-holesky.publicnode.com'],
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
