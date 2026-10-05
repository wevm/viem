import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const humanodeTestnet5 = /*#__PURE__*/ Chain.from({
  id: 14853,
  name: 'Humanode Testnet 5',
  nativeCurrency: { name: 'HMND', symbol: 'HMND', decimals: 18 },
  rpcUrls: {
    http: 'https://explorer-rpc-http.testnet5.stages.humanode.io',
    ws: 'wss://explorer-rpc-ws.testnet5.stages.humanode.io',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
  testnet: true,
})
