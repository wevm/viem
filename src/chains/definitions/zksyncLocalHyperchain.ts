import * as Chain from '../../core/Chain.js'

// The local hyperchain setup: https://github.com/matter-labs/local-setup/blob/main/zk-chains-docker-compose.yml

export const zksyncLocalHyperchain = /*#__PURE__*/ Chain.from({
  id: 270,
  name: 'ZKsync CLI Local Hyperchain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'http://localhost:15100',
    ws: 'ws://localhost:15101',
  },
  blockExplorers: {
    name: 'ZKsync explorer',
    url: 'http://localhost:15005/',
    apiUrl: 'http://localhost:15005/api',
  },
  testnet: true,
})
