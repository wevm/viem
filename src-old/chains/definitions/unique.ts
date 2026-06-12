import { defineChain } from '../../utils/chain/defineChain.js'

export const unique = /*#__PURE__*/ defineChain({
  id: 8880,
  name: 'Unique Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'UNQ',
    symbol: 'UNQ',
  },
  rpcUrls: {
    default: { http: ['https://rpc.unique.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Unique Subscan',
      url: 'https://unique.subscan.io/',
    },
  },
})
