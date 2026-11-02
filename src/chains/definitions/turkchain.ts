import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const turkchain = /*#__PURE__*/ Chain.from({
  id: 1919,
  name: 'Turkchain',
  nativeCurrency: {
    decimals: 18,
    name: 'TC',
    symbol: 'TURK',
  },
  rpcUrls: {
    http: 'https://rpc.turkscan.com',
    ws: 'wss://evm-ws.turkscan.com',
  },
  blockExplorers: {
    name: 'TurkScan',
    url: 'https://turkscan.com',
  },
  contracts: {
    create2: Contracts.create2,
  },
})
