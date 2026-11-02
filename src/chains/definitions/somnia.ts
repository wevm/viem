import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const somnia = /*#__PURE__*/ Chain.from({
  id: 5031,
  name: 'Somnia',
  nativeCurrency: { name: 'Somnia', symbol: 'SOMI', decimals: 18 },
  blockTime: 100,
  rpcUrls: {
    http: 'https://api.infra.mainnet.somnia.network',
  },
  blockExplorers: {
    name: 'Somnia Explorer',
    url: 'https://explorer.somnia.network',
    apiUrl: 'https://explorer.somnia.network/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0x5e44F178E8cF9B2F5409B6f18ce936aB817C5a11',
      blockCreated: 38516341,
    },
  },
  testnet: false,
})
