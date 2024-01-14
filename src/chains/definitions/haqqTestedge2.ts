import { defineChain } from '../../utils/chain/defineChain.js'

export const haqqTestedge2 = /*#__PURE__*/ defineChain({
  id: 54211,
  name: 'HAQQ Testedge 2',
  nativeCurrency: {
    decimals: 18,
    name: 'Islamic Coin',
    symbol: 'ISLMT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.eth.testedge2.haqq.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HAQQ Explorer',
      url: 'https://explorer.testedge2.haqq.network',
      apiUrl: 'https://explorer.testedge2.haqq.network/api',
    },
  },
})
