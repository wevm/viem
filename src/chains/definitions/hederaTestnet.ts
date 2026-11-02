import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const hederaTestnet = /*#__PURE__*/ Chain.from({
  id: 296,
  name: 'Hedera Testnet',
  nativeCurrency: {
    symbol: 'HBAR',
    name: 'HBAR',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://testnet.hashio.io/api',
  },
  blockExplorers: {
    name: 'Hashscan',
    url: 'https://hashscan.io/testnet',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
