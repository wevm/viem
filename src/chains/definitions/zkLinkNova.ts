import * as Chain from '../../core/Chain.js'

export const zkLinkNova = /*#__PURE__*/ Chain.from({
  id: 810180,
  name: 'zkLink Nova',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: { http: 'https://rpc.zklink.io' },
  blockExplorers: {
    name: 'zkLink Nova Block Explorer',
    url: 'https://explorer.zklink.io',
  },
})
