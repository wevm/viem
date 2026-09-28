import * as Chain from '../../core/Chain.js'

export const hychain = /*#__PURE__*/ Chain.from({
  id: 2911,
  name: 'HYCHAIN',
  nativeCurrency: { name: 'HYTOPIA', symbol: 'TOPIA', decimals: 18 },
  rpcUrls: { http: 'https://rpc.hychain.com/http' },
  blockExplorers: {
    name: 'HYCHAIN Explorer',
    url: 'https://explorer.hychain.com',
  },
  testnet: false,
})
