import { defineChain } from '../utils.js'

export const zkSyncLocalNodeL1 = /*#__PURE__*/ defineChain({
  id: 9,
  name: 'zkSync CLI Local Node L1',
  network: 'zksync-cli-local-node',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'],
    },
  },
  testnet: true,
})
