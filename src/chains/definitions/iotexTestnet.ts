import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const iotexTestnet = /*#__PURE__*/ Chain.from({
  id: 4_690,
  name: 'IoTeX Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IoTeX',
    symbol: 'IOTX',
  },
  rpcUrls: {
    http: 'https://babel-api.testnet.iotex.io',
    ws: 'wss://babel-api.testnet.iotex.io',
  },
  blockExplorers: {
    name: 'IoTeXScan',
    url: 'https://testnet.iotexscan.io',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xb5cecD6894c6f473Ec726A176f1512399A2e355d',
      blockCreated: 24347592,
    },
  },
  testnet: true,
})
