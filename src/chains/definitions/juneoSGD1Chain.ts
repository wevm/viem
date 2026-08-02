import * as Chain from '../../core/Chain.js'

export const juneoSGD1Chain = /*#__PURE__*/ Chain.from({
  id: 45_012,
  name: 'Juneo SGD1-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Juneo SGD1-Chain',
    symbol: 'SGD1',
  },
  rpcUrls: { http: 'https://rpc.juneo-mainnet.network/ext/bc/SGD1/rpc' },
  blockExplorers: {
    name: 'Juneo Scan',
    url: 'https://juneoscan.io/chain/7',
    apiUrl: 'https://juneoscan.io/chain/7/api',
  },
})
