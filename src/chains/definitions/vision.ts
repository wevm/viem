import * as Chain from '../../core/Chain.js'

export const vision = /*#__PURE__*/ Chain.define({
  id: 888888n,
  name: 'Vision',
  nativeCurrency: { name: 'VISION', symbol: 'VS', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://infragrid.v.network/ethereum/compatible'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Vision Scan',
      url: 'https://visionscan.org',
    },
  },
  testnet: false,
})
