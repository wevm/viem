import * as Chain from '../../core/Chain.js'

export const step = /*#__PURE__*/ Chain.from({
  id: 1234,
  name: 'Step Network',
  nativeCurrency: { name: 'FITFI', symbol: 'FITFI', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.step.network',
  },
  blockExplorers: {
    name: 'Step Scan',
    url: 'https://stepscan.io',
  },
  testnet: false,
})
