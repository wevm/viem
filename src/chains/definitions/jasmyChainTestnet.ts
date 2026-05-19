import * as Chain from '../../core/Chain.js'

export const jasmyChainTestnet = /*#__PURE__*/ Chain.define({
  id: 681n,
  name: 'Jasmy Chain Testnet',
  network: 'jasmyChainTestnet',
  nativeCurrency: { name: 'JasmyCoin', symbol: 'JASMY', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc_testnet.jasmychain.io'],
      webSocket: ['wss://rpc_testnet.jasmychain.io'],
    },
  },
  testnet: true,
})
