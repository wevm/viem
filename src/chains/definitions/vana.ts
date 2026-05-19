import * as Chain from '../../core/Chain.js'

export const vana = /*#__PURE__*/ Chain.define({
  id: 1480n,
  name: 'Vana',
  blockTime: 6_000,
  nativeCurrency: {
    decimals: 18,
    name: 'Vana',
    symbol: 'VANA',
  },
  rpcUrls: {
    default: { http: ['https://rpc.vana.org/'] },
  },
  blockExplorers: {
    default: {
      name: 'Vana Block Explorer',
      url: 'https://vanascan.io',
      apiUrl: 'https://vanascan.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xD8d2dFca27E8797fd779F8547166A2d3B29d360E',
      blockCreated: 716763,
    },
  },
})
