import { defineChain } from '../../utils/chain/defineChain.js'

export const bxn = /*#__PURE__*/ defineChain({
  id: 4999,
  name: 'BlackFort Exchange Network',
  nativeCurrency: { name: 'BlackFort Token', symbol: 'BXN', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.blackfort.network/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.blackfort.network',
      apiUrl: 'https://explorer.blackfort.network/api',
    },
  },
})
