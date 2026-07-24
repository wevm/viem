import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const dosChain = /*#__PURE__*/ Chain.from({
  id: 7979,
  name: 'DOS Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'DOS Chain',
    symbol: 'DOS',
  },
  rpcUrls: { http: 'https://main.doschain.com' },
  blockExplorers: {
    name: 'DOS Chain Explorer',
    url: 'https://doscan.io',
    apiUrl: 'https://api.doscan.io',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 161908,
    },
  },
})
