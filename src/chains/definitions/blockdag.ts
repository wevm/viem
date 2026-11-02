import * as Chain from '../../core/Chain.js'

export const blockdag = /*#__PURE__*/ Chain.from({
  id: 1404,
  name: 'BlockDAG',
  nativeCurrency: {
    decimals: 18,
    name: 'BlockDAG',
    symbol: 'BDAG',
  },
  rpcUrls: {
    http: ['https://rpc.bdagexplorer.com/'],
  },
  blockExplorers: {
    name: 'BDAG Explorer',
    url: 'https://explorer.bdagexplorer.com',
  },
})
