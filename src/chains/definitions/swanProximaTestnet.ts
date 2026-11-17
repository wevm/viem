import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const swanProximaTestnet = /*#__PURE__*/ Chain.from({
  id: 20241133,
  name: 'Swan Proxima Testnet',
  nativeCurrency: { name: 'Swan Ether', symbol: 'sETH', decimals: 18 },
  rpcUrls: { http: 'https://rpc-proxima.swanchain.io' },
  blockExplorers: {
    name: 'Swan Explorer',
    url: 'https://proxima-explorer.swanchain.io',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
