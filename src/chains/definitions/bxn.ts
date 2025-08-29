import { defineChain } from '../../utils/chain/defineChain.js'

export const bxn = /*#__PURE__*/ defineChain({
  id: 488,
  name: 'BlackFort Exchange Network',
  nativeCurrency: { name: 'BlackFort Token', symbol: 'BXN', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.blackfort.network/mainnet/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blackfortscan.com',
      apiUrl: 'https://blackfort.com/api',
    },
  },
})
