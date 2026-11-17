import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const iotex = /*#__PURE__*/ Chain.from({
  id: 4_689,
  name: 'IoTeX',
  nativeCurrency: {
    decimals: 18,
    name: 'IoTeX',
    symbol: 'IOTX',
  },
  rpcUrls: {
    http: 'https://babel-api.mainnet.iotex.io',
    ws: 'wss://babel-api.mainnet.iotex.io',
  },
  blockExplorers: {
    name: 'IoTeXScan',
    url: 'https://iotexscan.io',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 22163670,
    },
  },
})
