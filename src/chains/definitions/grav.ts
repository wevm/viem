import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const grav = /*#__PURE__*/ Chain.from({
  id: 127001,
  name: 'Gravity',
  nativeCurrency: { name: 'Gravity', symbol: 'G', decimals: 18 },
  rpcUrls: {
    http: 'https://mainnet-rpc.gravity.xyz',
  },
  blockExplorers: {
    name: 'Gravity Mainnet Explorer',
    url: 'https://mainnet-explorer.gravity.xyz',
    apiUrl: 'https://mainnet-explorer.gravity.xyz/api',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
