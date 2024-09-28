import { defineChain } from '../../utils/chain/defineChain.js'

export const vision = /*#__PURE__*/ defineChain({
  id: 888888,
  name: 'Vision',
  nativeCurrency: { name: 'VISION', symbol: 'VS', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://infragrid.v.network/ethereum/compatible',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Vision Scan',
      url: 'https://visionscan.org',
    },
  },
})
