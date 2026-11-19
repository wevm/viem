import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

export const zksyncEraTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 312,
  name: 'ZKsync Era Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.zksync-era-testnet.zksync.dev'],
      webSocket: ['wss://rpc.zksync-era-testnet.zksync.dev/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ZKsync Explorer',
      url: 'https://block-explorer.zksync-era-testnet.zksync.dev',
      apiUrl: 'https://block-explorer-api.zksync-era-testnet.zksync.dev/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 10618,
    },
  },
  testnet: true,
})
