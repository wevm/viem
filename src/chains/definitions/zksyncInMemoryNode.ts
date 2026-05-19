import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

export const zksyncInMemoryNode = /*#__PURE__*/ Chain.define({
  ...chainConfig,
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
