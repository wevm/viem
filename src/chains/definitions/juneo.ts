import * as Chain from '../../core/Chain.js'

export const juneo = /*#__PURE__*/ Chain.define({
  id: 45_003n,
  name: 'Juneo JUNE-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'JUNE-Chain',
    symbol: 'JUNE',
  },
  rpcUrls: {
    default: { http: ['https://rpc.juneo-mainnet.network/ext/bc/JUNE/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Juneo Scan',
      url: 'https://juneoscan.io/chain/2',
      apiUrl: 'https://juneoscan.io/chain/2/api',
    },
  },
})
