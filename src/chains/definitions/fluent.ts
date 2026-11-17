import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const fluent = /*#__PURE__*/ Chain.from({
  id: 25_363,
  name: 'Fluent',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.fluent.xyz',
  },
  blockExplorers: {
    name: 'Fluent Explorer',
    url: 'https://fluentscan.xyz',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
