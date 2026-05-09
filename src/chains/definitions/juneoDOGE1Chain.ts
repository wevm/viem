import { defineChain } from '../../utils/chain/defineChain.js'

export const juneoDOGE1Chain = /*#__PURE__*/ defineChain({
  id: 45_010,
  name: 'Juneo DOGE1-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Juneo DOGE1-Chain',
    symbol: 'DOGE1',
  },
  rpcUrls: {
    default: { http: ['https://rpc.juneo-mainnet.network/ext/bc/DOGE1/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Juneo Scan',
      url: 'https://juneoscan.io/chain/10',
      apiUrl: 'https://juneoscan.io/chain/10/api',
    },
  },
})
