import { defineChain } from '../../utils/chain/defineChain.js'

export const vordiumTestnet = /*#__PURE__*/ defineChain({
  id: 101_102,
  name: 'Vordium Testnet',
  nativeCurrency: { name: 'Vordium Testnet', symbol: 'VORD', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.vordium.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'VordScan Testnet',
      url: 'https://testnet.vordscan.io',
      apiUrl: 'https://testnet.vordscan.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1,
    },
  },
  testnet: true,
})
