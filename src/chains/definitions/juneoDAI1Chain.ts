import * as Chain from '../../core/Chain.js'

export const juneoDAI1Chain = /*#__PURE__*/ Chain.define({
  id: 45_004n,
  name: 'Juneo DAI1-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Juneo DAI1-Chain',
    symbol: 'DAI1',
  },
  rpcUrls: {
    default: { http: ['https://rpc.juneo-mainnet.network/ext/bc/DAI1/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Juneo Scan',
      url: 'https://juneoscan.io/chain/5',
      apiUrl: 'https://juneoscan.io/chain/5/api',
    },
  },
})
