import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const energy = /*#__PURE__*/ Chain.from({
  id: 246,
  name: 'Energy Mainnet',
  nativeCurrency: { name: 'EWT', symbol: 'EWT', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.energyweb.org',
  },
  blockExplorers: {
    name: 'EnergyWeb Explorer',
    url: 'https://explorer.energyweb.org',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
