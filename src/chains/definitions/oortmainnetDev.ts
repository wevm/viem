import { defineChain } from '../../utils/chain/defineChain.js'

export const oortMainnetDev = /*#__PURE__*/ defineChain({
  id: 9700,
  name: 'OORT MainnetDev',
  nativeCurrency: {
    decimals: 18,
    name: 'OORT',
    symbol: 'OORT',
  },
  rpcUrls: {
    default: { http: ['https://dev-rpc.oortech.com'] },
  },
  blockExplorers: {
    oort: {
      name: 'OORT MainnetDev Explorer',
      url: 'https://dev-scan.oortech.com',
    },
    default: {
      name: 'OORT MainnetDev Explorer',
      url: 'https://dev-scan.oortech.com',
    },
  },
})
