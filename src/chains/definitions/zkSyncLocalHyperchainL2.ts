import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

export const zkSyncLocalHyperchain = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 270,
  name: 'zkSync CLI Local Hyperchain',
  network: 'zksync-cli-local-hyperchain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:15100'],
    },
  },
  testnet: true,
})
