import * as Chain from '../../core/Chain.js'

export const juneoBCH1Chain = /*#__PURE__*/ Chain.from({
  id: 45_013,
  name: 'Juneo BCH1-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Juneo BCH1-Chain',
    symbol: 'BCH1',
  },
  rpcUrls: { http: 'https://rpc.juneo-mainnet.network/ext/bc/BCH1/rpc' },
  blockExplorers: {
    name: 'Juneo Scan',
    url: 'https://juneoscan.io/chain/12',
    apiUrl: 'https://juneoscan.io/chain/12/api',
  },
})
