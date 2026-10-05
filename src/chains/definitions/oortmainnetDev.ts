import * as Chain from '../../core/Chain.js'

export const oortMainnetDev = /*#__PURE__*/ Chain.from({
  id: 9700,
  name: 'OORT MainnetDev',
  nativeCurrency: {
    decimals: 18,
    name: 'OORT',
    symbol: 'OORT',
  },
  rpcUrls: { http: 'https://dev-rpc.oortech.com' },
  blockExplorers: {
    name: 'OORT MainnetDev Explorer',
    url: 'https://dev-scan.oortech.com',
  },
})
