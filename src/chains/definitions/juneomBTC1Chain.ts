import * as Chain from '../../core/Chain.js'

export const juneomBTC1Chain = /*#__PURE__*/ Chain.from({
  id: 45_007,
  name: 'Juneo mBTC1-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Juneo mBTC1-Chain',
    symbol: 'mBTC1',
  },
  rpcUrls: { http: 'https://rpc.juneo-mainnet.network/ext/bc/mBTC1/rpc' },
  blockExplorers: {
    name: 'Juneo Scan',
    url: 'https://juneoscan.io/chain/9',
    apiUrl: 'https://juneoscan.io/chain/9/api',
  },
})
