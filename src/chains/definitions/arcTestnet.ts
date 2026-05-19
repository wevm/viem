import * as Chain from '../../core/Chain.js'

export const arcTestnet = /*#__PURE__*/ Chain.define({
  id: 5042002n,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.testnet.arc.network',
        'https://rpc.quicknode.testnet.arc.network',
        'https://rpc.blockdaemon.testnet.arc.network',
      ],
      webSocket: [
        'wss://rpc.testnet.arc.network',
        'wss://rpc.quicknode.testnet.arc.network',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
      apiUrl: 'https://testnet.arcscan.app/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: true,
})
