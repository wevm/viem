import * as Chain from '../../core/Chain.js'

export const jasmyChainTestnet = /*#__PURE__*/ Chain.from({
  id: 681,
  name: 'Jasmy Chain Testnet',
  nativeCurrency: { name: 'JasmyCoin', symbol: 'JASMY', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc_testnet.jasmychain.io'],
      webSocket: ['wss://rpc_testnet.jasmychain.io'],
    },
  },
  testnet: true,
})
