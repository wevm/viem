import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const goat = /*#__PURE__*/ Chain.from({
  id: 2345,
  name: 'GOAT',
  nativeCurrency: {
    decimals: 18,
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  rpcUrls: { http: 'https://rpc.goat.network' },
  blockExplorers: {
    name: 'Goat Explorer',
    url: 'https://explorer.goat.network',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
})
