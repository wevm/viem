import * as Chain from '../../core/Chain.js'

export const iotaTestnet = /*#__PURE__*/ Chain.from({
  id: 1075,
  name: 'IOTA EVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IOTA',
    symbol: 'IOTA',
  },
  rpcUrls: {
    default: {
      http: ['https://json-rpc.evm.testnet.iotaledger.net'],
      webSocket: ['wss://ws.json-rpc.evm.testnet.iotaledger.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.evm.testnet.iotaledger.net',
      apiUrl: 'https://explorer.evm.testnet.iotaledger.net/api',
    },
  },
  testnet: true,
})
