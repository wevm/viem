import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const iota = /*#__PURE__*/ Chain.from({
  id: 8822,
  name: 'IOTA EVM',
  nativeCurrency: {
    decimals: 18,
    name: 'IOTA',
    symbol: 'IOTA',
  },
  rpcUrls: {
    http: 'https://json-rpc.evm.iotaledger.net',
    ws: 'wss://ws.json-rpc.evm.iotaledger.net',
  },
  blockExplorers: {
    name: 'Explorer',
    url: 'https://explorer.evm.iota.org',
    apiUrl: 'https://explorer.evm.iota.org/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 25022,
    },
  },
})
