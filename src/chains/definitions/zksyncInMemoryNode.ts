import * as Chain from '../../core/Chain.js'

export const zksyncInMemoryNode = /*#__PURE__*/ Chain.define({
  blockTime: 1_000,
  id: 260n,
  name: 'ZKsync InMemory Node',
  network: 'zksync-in-memory-node',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:8011'],
    },
  },
  testnet: true,
})
