import { defineChain } from '../../utils/chain/defineChain.js'

export const qmsTestnet = /*#__PURE__*/ defineChain({
  id: 19480,
  name: 'QMS Testnet',
  nativeCurrency: { name: 'QMS', symbol: 'QMS', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.qms.finance'],
      webSocket: ['wss://rpc.testnet.qms.finance'],
    },
  },
  blockExplorers: {
    default: {
      name: 'QMS Testnet Explorer',
      url: 'https://testnet.qmsscan.io',
      apiUrl: 'https://testnet.qmsscan.io/api',
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
