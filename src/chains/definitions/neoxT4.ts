import * as Chain from '../../core/Chain.js'

export const neoxT4 = /*#__PURE__*/ Chain.define({
  id: 12227332n,
  name: 'Neo X Testnet T4',
  nativeCurrency: { name: 'Gas', symbol: 'GAS', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.rpc.banelabs.org/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'neox-scan',
      url: 'https://xt4scan.ngd.network',
    },
  },
  testnet: true,
})
