import * as Chain from '../../core/Chain.js'

export const oortMainnetDev = /*#__PURE__*/ Chain.from({
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
    default: {
      name: 'OORT MainnetDev Explorer',
      url: 'https://dev-scan.oortech.com',
    },
  },
})
