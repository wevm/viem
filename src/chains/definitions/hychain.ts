import * as Chain from '../../core/Chain.js'

export const hychain = /*#__PURE__*/ Chain.define({
  id: 2911n,
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
