import { defineChain } from '../../utils/chain/defineChain.js'

export const ql1 = /*#__PURE__*/ defineChain({
  id: 766,
  name: 'Qom Mainnet',
  nativeCurrency: { name: 'Qom', symbol: 'QOM', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.qom.one'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Qom Explorer',
      url: 'https://scan.qom.one',
    },
  },
})
