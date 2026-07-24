import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const chiliz = /*#__PURE__*/ Chain.from({
  id: 88_888,
  name: 'Chiliz Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    http: 'https://rpc.chiliz.com',
  },
  blockExplorers: {
    name: 'Chiliz Explorer',
    url: 'https://scan.chiliz.com',
    apiUrl: 'https://scan.chiliz.com/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 8080847,
    },
  },
})
