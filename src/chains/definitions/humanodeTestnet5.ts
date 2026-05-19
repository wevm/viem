import * as Chain from '../../core/Chain.js'

export const humanodeTestnet5 = /*#__PURE__*/ Chain.define({
  id: 14853n,
  name: 'Humanode Testnet 5',
  nativeCurrency: { name: 'HMND', symbol: 'HMND', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://explorer-rpc-http.testnet5.stages.humanode.io'],
      webSocket: ['wss://explorer-rpc-ws.testnet5.stages.humanode.io'],
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
  testnet: true,
})
