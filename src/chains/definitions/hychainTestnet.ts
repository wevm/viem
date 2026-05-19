import * as Chain from '../../core/Chain.js'

export const hychainTestnet = /*#__PURE__*/ Chain.define({
  id: 29112n,
  name: 'HYCHAIN Testnet',
  nativeCurrency: { name: 'HYTOPIA', symbol: 'TOPIA', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.hychain.com/http'] },
  },
  blockExplorers: {
    default: {
      name: 'HYCHAIN Explorer',
      url: 'https://testnet-rpc.hychain.com/http',
    },
  },
  testnet: true,
})
