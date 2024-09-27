import { defineChain } from '../../utils/chain/defineChain.js'

export const hychain = /*#__PURE__*/ defineChain({
  id: 2911,
  name: 'HYCHAIN',
  nativeCurrency: { name: 'HYTOPIA', symbol: 'TOPIA', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.hychain.com/http'] },
  },
  blockExplorers: {
    default: {
      name: 'HYCHAIN Explorer',
      url: 'https://explorer.hychain.com',
    },
  },
  testnet: false,
})
