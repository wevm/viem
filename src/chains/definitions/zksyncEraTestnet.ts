import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const zksyncEraTestnet = /*#__PURE__*/ Chain.from({
  id: 312,
  name: 'ZKsync Era Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.zksync-era-testnet.zksync.dev',
    ws: 'wss://rpc.zksync-era-testnet.zksync.dev/ws',
  },
  blockExplorers: {
    name: 'ZKsync Explorer',
    url: 'https://block-explorer.zksync-era-testnet.zksync.dev',
    apiUrl: 'https://block-explorer-api.zksync-era-testnet.zksync.dev/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 10618,
    },
  },
  testnet: true,
})
