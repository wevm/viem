import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const lensTestnet = /*#__PURE__*/ Chain.from({
  id: 37_111,
  name: 'Lens Testnet',
  nativeCurrency: { name: 'GRASS', symbol: 'GRASS', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.testnet.lens.dev',
    ws: 'wss://rpc.testnet.lens.dev/ws',
  },
  blockExplorers: {
    name: 'Lens Block Explorer',
    url: 'https://block-explorer.testnet.lens.dev',
    apiUrl: 'https://block-explorer-api.staging.lens.dev/api',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
