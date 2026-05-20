import * as Chain from '../../core/Chain.js'

// The local hyperchain setup: https://github.com/matter-labs/local-setup/blob/main/zk-chains-docker-compose.yml

export const zksyncLocalHyperchain = /*#__PURE__*/ Chain.define({
  blockTime: 1_000,
  id: 270n,
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
