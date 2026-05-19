import * as Chain from '../../core/Chain.js'

export const oortMainnetDev = /*#__PURE__*/ Chain.define({
  id: 9700n,
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
    default: {
      name: 'OORT MainnetDev Explorer',
      url: 'https://dev-scan.oortech.com',
    },
  },
})
