import { defineChain } from '../../utils/chain/defineChain.js'

export const juneoLTC1Chain = /*#__PURE__*/ defineChain({
  id: 45_009,
  name: 'Juneo LTC1-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Juneo LTC1-Chain',
    symbol: 'LTC1',
  },
  rpcUrls: {
    default: { http: ['https://rpc.juneo-mainnet.network/ext/bc/LTC1/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Juneo Scan',
      url: 'https://juneoscan.io/chain/11',
      apiUrl: 'https://juneoscan.io/chain/11/api',
    },
  },
})
