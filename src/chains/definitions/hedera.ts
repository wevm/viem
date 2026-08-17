import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const hedera = /*#__PURE__*/ Chain.from({
  id: 295,
  name: 'Hedera Mainnet',
  nativeCurrency: {
    symbol: 'HBAR',
    name: 'HBAR',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://mainnet.hashio.io/api',
  },
  blockExplorers: {
    name: 'Hashscan',
    url: 'https://hashscan.io/mainnet',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
