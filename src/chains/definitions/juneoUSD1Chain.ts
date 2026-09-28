import * as Chain from '../../core/Chain.js'

export const juneoUSD1Chain = /*#__PURE__*/ Chain.from({
  id: 45_006,
  name: 'Juneo USD1-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Juneo USD1-Chain',
    symbol: 'USD1',
  },
  rpcUrls: { http: 'https://rpc.juneo-mainnet.network/ext/bc/USD1/rpc' },
  blockExplorers: {
    name: 'Juneo Scan',
    url: 'https://juneoscan.io/chain/4',
    apiUrl: 'https://juneoscan.io/chain/4/api',
  },
})
