import * as Chain from '../../core/Chain.js'

export const juneoEUR1Chain = /*#__PURE__*/ Chain.define({
  id: 45_011n,
  name: 'Juneo EUR1-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Juneo EUR1-Chain',
    symbol: 'EUR1',
  },
  rpcUrls: {
    default: { http: ['https://rpc.juneo-mainnet.network/ext/bc/EUR1/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Juneo Scan',
      url: 'https://juneoscan.io/chain/6',
      apiUrl: 'https://juneoscan.io/chain/6/api',
    },
  },
})
