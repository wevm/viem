import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

// The local hyperchain setup: https://github.com/matter-labs/local-setup/blob/main/zk-chains-docker-compose.yml

export const zksyncLocalHyperchain = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 270,
  name: 'ZKsync CLI Local Hyperchain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:15100'],
      webSocket: ['ws://localhost:15101'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ZKsync explorer',
      url: 'http://localhost:15005/',
      apiUrl: 'http://localhost:15005/api',
    },
  },
  testnet: true,
})
