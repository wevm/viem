import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const citrate = /*#__PURE__*/ Chain.from({
  id: 40_204,
  name: 'Citrate',
  nativeCurrency: { name: 'SALT', symbol: 'SALT', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.citrate.ai',
    ws: 'wss://rpc.citrate.ai',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
