import { defineChain } from '../../utils/chain/defineChain.js'

export const zkLinkNova = /*#__PURE__*/ defineChain({
  id: 810180,
  name: 'zkLink Nova',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.zklink.io'] },
  },
  blockExplorers: {
    default: {
      name: 'zkLink Nova Block Explorer',
      url: 'https://explorer.zklink.io',
    },
  },
})
