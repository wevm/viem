import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const rei = /*#__PURE__*/ Chain.from({
  id: 47805,
  name: 'REI Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'REI',
    symbol: 'REI',
  },
  rpcUrls: {
    http: 'https://rpc.rei.network',
    ws: 'wss://rpc.rei.network',
  },
  blockExplorers: {
    name: 'REI Scan',
    url: 'https://scan.rei.network',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
