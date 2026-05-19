import * as Chain from '../../core/Chain.js'

export const juneoBCH1Chain = /*#__PURE__*/ Chain.define({
  id: 45_013n,
  name: 'Juneo BCH1-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Juneo BCH1-Chain',
    symbol: 'BCH1',
  },
  rpcUrls: {
    default: { http: ['https://rpc.juneo-mainnet.network/ext/bc/BCH1/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Juneo Scan',
      url: 'https://juneoscan.io/chain/12',
      apiUrl: 'https://juneoscan.io/chain/12/api',
    },
  },
})
