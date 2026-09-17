import { defineChain } from '../../utils/chain/defineChain.js'

export const eCanna = /*#__PURE__*/ defineChain({
  id: 4111,
  name: 'E Canna Mainnet',
  nativeCurrency: {
    name: 'E Canna',
    symbol: 'ECNA',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.ecnascan.com'] },
  },
  blockExplorers: {
    default: {
      name: 'ECNA Scan',
      url: 'https://explorer.ecnascan.com',
    },
  },
})
