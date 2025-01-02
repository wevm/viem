import { defineChain } from '../../utils/chain/defineChain.js'

export const humanodeTestnet5 = /*#__PURE__*/ defineChain({
  id: 14853,
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
})
