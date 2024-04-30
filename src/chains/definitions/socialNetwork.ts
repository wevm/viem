import { defineChain } from '../../utils/chain/defineChain.js'

export const socialNetwork = /*#__PURE__*/ defineChain({
  id: 149,
  name: 'Social Network',
  nativeCurrency: {
    decimals: 18,
    name: 'heart',
    symbol: 'HEART',
  },
  rpcUrls: {
    default: { http: ['https://social-network-rpc.com'] },
  },
  blockExplorers: {
    default: {
      name: 'The Social Network',
      url: 'https://the.social.network',
      apiUrl: 'https://the.social.network/api',
    },
  },
})
