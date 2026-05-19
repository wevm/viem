import * as Chain from '../../core/Chain.js'

export const zkLinkNova = /*#__PURE__*/ Chain.define({
  id: 810180n,
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
