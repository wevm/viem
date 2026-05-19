import * as Chain from '../../core/Chain.js'

export const juneomBTC1Chain = /*#__PURE__*/ Chain.define({
  id: 45_007n,
  name: 'Juneo mBTC1-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Juneo mBTC1-Chain',
    symbol: 'mBTC1',
  },
  rpcUrls: {
    default: { http: ['https://rpc.juneo-mainnet.network/ext/bc/mBTC1/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Juneo Scan',
      url: 'https://juneoscan.io/chain/9',
      apiUrl: 'https://juneoscan.io/chain/9/api',
    },
  },
})
