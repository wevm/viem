import * as Chain from '../../core/Chain.js'

// The local hyperchain setup: https://github.com/matter-labs/local-setup/blob/main/zk-chains-docker-compose.yml

export const zksyncLocalCustomHyperchain = /*#__PURE__*/ Chain.from({
  id: 272,
  name: 'ZKsync CLI Local Custom Hyperchain',
  nativeCurrency: { name: 'BAT', symbol: 'BAT', decimals: 18 },
  rpcUrls: {
    http: 'http://localhost:15200',
    ws: 'ws://localhost:15201',
  },
  blockExplorers: {
    name: 'ZKsync explorer',
    url: 'http://localhost:15005/',
    apiUrl: 'http://localhost:15005/api',
  },
  testnet: true,
})
