import * as Chain from '../../core/Chain.js'

export const step = /*#__PURE__*/ Chain.define({
  id: 1234n,
  name: 'Step Network',
  nativeCurrency: { name: 'FITFI', symbol: 'FITFI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.step.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Step Scan',
      url: 'https://stepscan.io',
    },
  },
  testnet: false,
})
