import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

// The local hyperchain setup: https://github.com/matter-labs/local-setup/blob/main/zk-chains-docker-compose.yml

export const zksyncLocalHyperchain = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 270,
  name: 'ZKsync CLI Local Hyperchain',
  network: 'zksync-cli-local-hyperchain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:15100'],
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

export const zksyncLocalCustomHyperchain = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 272,
  name: 'ZKsync CLI Local Hyperchain',
  network: 'zksync-cli-local-custom-hyperchain',
  nativeCurrency: { name: 'BAT', symbol: 'BAT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:15200'],
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

export const zksyncLocalHyperchainL1 = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 9,
  name: 'ZKsync CLI Local Hyperchain L1',
  network: 'zksync-cli-local-hyperchain-l1',
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
