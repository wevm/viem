import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const vana = /*#__PURE__*/ Chain.from({
  id: 1480,
  name: 'Vana',
  blockTime: 6_000,
  nativeCurrency: {
    decimals: 18,
    name: 'Vana',
    symbol: 'VANA',
  },
  rpcUrls: { http: 'https://rpc.vana.org/' },
  blockExplorers: {
    name: 'Vana Block Explorer',
    url: 'https://vanascan.io',
    apiUrl: 'https://vanascan.io/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xD8d2dFca27E8797fd779F8547166A2d3B29d360E',
      blockCreated: 716763,
    },
  },
})
