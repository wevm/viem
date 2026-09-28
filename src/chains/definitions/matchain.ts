import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const matchain = /*#__PURE__*/ Chain.from({
  id: 698,
  name: 'Matchain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: { http: 'https://rpc.matchain.io' },
  blockExplorers: {
    name: 'Matchain Scan',
    url: 'https://matchscan.io',
  },
  contracts: {
    create2: Contracts.create2,
  },
})
