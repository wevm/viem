import { defineChain } from '../../utils/chain/defineChain.js'

export const haqqMainnet = /*#__PURE__*/ defineChain({
  id: 11235,
  name: 'HAQQ Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Islamic Coin',
    symbol: 'ISLM',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.eth.haqq.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HAQQ Explorer',
      url: 'https://explorer.haqq.network',
      apiUrl: 'https://explorer.haqq.network/api',
    },
  },
})
