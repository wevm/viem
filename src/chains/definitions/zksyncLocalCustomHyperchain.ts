import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

// The local hyperchain setup: https://github.com/matter-labs/local-setup/blob/main/zk-chains-docker-compose.yml

export const zksyncLocalCustomHyperchain = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 272,
  name: 'ZKsync CLI Local Custom Hyperchain',
  nativeCurrency: { name: 'BAT', symbol: 'BAT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:15200'],
      webSocket: ['ws://localhost:15201'],
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
