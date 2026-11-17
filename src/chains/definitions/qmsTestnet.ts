import * as Chain from '../../core/Chain.js'

export const qmsTestnet = /*#__PURE__*/ Chain.from({
  id: 19480,
  name: 'QMS Testnet',
  nativeCurrency: { name: 'QMS', symbol: 'QMS', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.testnet.qms.finance',
    ws: 'wss://rpc.testnet.qms.finance',
  },
  blockExplorers: {
    name: 'QMS Testnet Explorer',
    url: 'https://testnet.qmsscan.io',
    apiUrl: 'https://testnet.qmsscan.io/api',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: true,
})
