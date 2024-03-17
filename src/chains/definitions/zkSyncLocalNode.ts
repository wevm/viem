import { defineChain } from '../../utils/chain/defineChain.js'

export const zkSyncLocalNode = /*#__PURE__*/ defineChain({
  id: 270,
  name: 'zkSync CLI Local Node',
  network: 'zksync-cli-local-node',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:3050'],
    },
  },
  testnet: true,
})
