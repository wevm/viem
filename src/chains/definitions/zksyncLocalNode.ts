import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

export const zksyncLocalNode = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 270n,
  name: 'ZKsync CLI Local Node',
  network: 'zksync-cli-local-node',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:3050'],
    },
  },
  testnet: true,
})
