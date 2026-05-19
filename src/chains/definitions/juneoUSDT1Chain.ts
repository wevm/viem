import * as Chain from '../../core/Chain.js'

export const juneoUSDT1Chain = /*#__PURE__*/ Chain.define({
  id: 45_005n,
  name: 'Juneo USDT1-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Juneo USDT1-Chain',
    symbol: 'USDT1',
  },
  rpcUrls: {
    default: { http: ['https://rpc.juneo-mainnet.network/ext/bc/USDT1/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Juneo Scan',
      url: 'https://juneoscan.io/chain/3',
      apiUrl: 'https://juneoscan.io/chain/3/api',
    },
  },
})
