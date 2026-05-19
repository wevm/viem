import * as Chain from '../../core/Chain.js'

export const juneoLINK1Chain = /*#__PURE__*/ Chain.define({
  id: 45_014n,
  name: 'Juneo LINK1-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Juneo LINK1-Chain',
    symbol: 'LINK1',
  },
  rpcUrls: {
    default: { http: ['https://rpc.juneo-mainnet.network/ext/bc/LINK1/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Juneo Scan',
      url: 'https://juneoscan.io/chain/13',
      apiUrl: 'https://juneoscan.io/chain/13/api',
    },
  },
})
