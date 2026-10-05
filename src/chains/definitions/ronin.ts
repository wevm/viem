import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const ronin = /*#__PURE__*/ Chain.from({
  id: 2020,
  name: 'Ronin',
  nativeCurrency: { name: 'RON', symbol: 'RON', decimals: 18 },
  rpcUrls: {
    http: 'https://api.roninchain.com/rpc',
  },
  blockExplorers: {
    name: 'Ronin Explorer',
    url: 'https://app.roninchain.com',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 26023535,
    },
  },
})
