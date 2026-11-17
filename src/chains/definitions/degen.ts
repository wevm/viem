import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const degen = /*#__PURE__*/ Chain.from({
  id: 666666666,
  name: 'Degen',
  nativeCurrency: {
    decimals: 18,
    name: 'Degen',
    symbol: 'DEGEN',
  },
  rpcUrls: {
    http: 'https://rpc.degen.tips',
    ws: 'wss://rpc.degen.tips',
  },
  blockExplorers: {
    name: 'Degen Chain Explorer',
    url: 'https://explorer.degen.tips',
    apiUrl: 'https://explorer.degen.tips/api/v2',
  },
  contracts: {
    create2: Contracts.create2,
  },
})
