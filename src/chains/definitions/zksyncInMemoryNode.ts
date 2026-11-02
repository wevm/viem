import * as Chain from '../../core/Chain.js'

export const zksyncInMemoryNode = /*#__PURE__*/ Chain.from({
  id: 260,
  name: 'ZKsync InMemory Node',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'http://localhost:8011',
  },
  testnet: true,
})
