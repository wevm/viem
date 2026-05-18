import { defineChain } from '../../utils/chain/defineChain.js'

export const victionTestnet = /*#__PURE__*/ defineChain({
  id: 89,
  name: 'Viction Testnet',
  nativeCurrency: { name: 'Viction', symbol: 'VIC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.viction.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'VIC Scan',
      url: 'https://testnet.vicscan.xyz',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 12170179,
    },
  },
  testnet: true,
})
