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
  testnet: true,
})
