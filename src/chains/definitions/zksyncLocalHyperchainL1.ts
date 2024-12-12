import { defineChain } from '../../utils/chain/defineChain.js'

// The local hyperchain setup: https://github.com/matter-labs/local-setup/blob/main/zk-chains-docker-compose.yml

export const zksyncLocalHyperchainL1 = /*#__PURE__*/ defineChain({
  id: 9,
  name: 'ZKsync CLI Local Hyperchain L1',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:15045'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'http://localhost:15001/',
      apiUrl: 'http://localhost:15001/api/v2',
    },
  },
  testnet: true,
})
