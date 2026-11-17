import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const qTestnet = /*#__PURE__*/ Chain.from({
  id: 35443,
  name: 'Q Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Q',
    symbol: 'Q',
  },
  rpcUrls: { http: 'https://rpc.qtestnet.org' },
  blockExplorers: {
    name: 'Q Testnet Explorer',
    url: 'https://explorer.qtestnet.org',
    apiUrl: 'https://explorer.qtestnet.org/api',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
