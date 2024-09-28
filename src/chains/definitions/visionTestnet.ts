import { defineChain } from '../../utils/chain/defineChain.js'

export const visionTestnet = /*#__PURE__*/ defineChain({
  id: 666666,
  name: 'Vision Testnet',
  nativeCurrency: { name: 'VISION', symbol: 'VS', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://vpioneer.infragrid.v.network/ethereum/compatible'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Vision Scan',
      url: 'https://visionscan.org/?chain=vpioneer',
    },
  },
  testnet: true,
})
