import { defineChain } from '../../utils/chain/defineChain.js'

export const juneoLINK1Chain = /*#__PURE__*/ defineChain({
  id: 45_014,
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
