import { defineChain } from '../../utils/chain/defineChain.js'

export const juneoSGD1Chain = /*#__PURE__*/ defineChain({
  id: 45_012,
  name: 'Juneo SGD1-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Juneo SGD1-Chain',
    symbol: 'SGD1',
  },
  rpcUrls: {
    default: { http: ['https://rpc.juneo-mainnet.network/ext/bc/SGD1/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Juneo Scan',
      url: 'https://juneoscan.io/chain/7',
      apiUrl: 'https://juneoscan.io/chain/7/api',
    },
  },
})
