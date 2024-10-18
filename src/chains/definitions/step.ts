import { defineChain } from '../../utils/chain/defineChain.js'

export const step = /*#__PURE__*/ defineChain({
  id: 1234,
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
