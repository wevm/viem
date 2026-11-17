import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const stratis = /*#__PURE__*/ Chain.from({
  id: 105105,
  name: 'Stratis Mainnet',
  nativeCurrency: {
    name: 'Stratis',
    symbol: 'STRAX',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.stratisevm.com',
  },
  blockExplorers: {
    name: 'Stratis Explorer',
    url: 'https://explorer.stratisevm.com',
  },
  contracts: {
    create2: Contracts.create2,
  },
})
