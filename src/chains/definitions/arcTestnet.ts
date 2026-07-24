import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const arcTestnet = /*#__PURE__*/ Chain.from({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    http: [
      'https://rpc.testnet.arc.network',
      'https://rpc.quicknode.testnet.arc.network',
      'https://rpc.blockdaemon.testnet.arc.network',
    ],
    ws: [
      'wss://rpc.testnet.arc.network',
      'wss://rpc.quicknode.testnet.arc.network',
    ],
  },
  blockExplorers: {
    name: 'ArcScan',
    url: 'https://testnet.arcscan.app',
    apiUrl: 'https://testnet.arcscan.app/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: true,
})
