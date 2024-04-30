import { defineChain } from '../../utils/chain/defineChain.js'

export const socialTestnet = /*#__PURE__*/ defineChain({
  id: 149,
  name: 'Social Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'heart',
    symbol: 'HEART',
  },
  rpcUrls: {
    default: { http: ['https://testnet.social-network-rpc.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Social Testnet',
      url: 'https://testnet.social.network',
      apiUrl: 'https://testnet.social.network/api',
    },
  },
})