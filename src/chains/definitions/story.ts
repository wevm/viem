import { defineChain } from '../../utils/chain/defineChain.js'

export const story = /*#__PURE__*/ defineChain({
  id: 1514,
  name: 'Story',
  nativeCurrency: {
    decimals: 18,
    name: 'IP Token',
    symbol: 'IP',
  },
  blockExplorers: {
    default: {
      name: 'Story explorer',
      url:'https://www.storyscan.xyz/',
      apiUrl: 'https://www.storyscan.xyz/api/v2/'
    }
  },
  rpcUrls: {
    default: { http: ['https://mainnet.storyrpc.io'] },
  },
  testnet: false,
})
