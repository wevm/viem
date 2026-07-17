import * as Chain from '../../core/Chain.js'

export const hychainTestnet = /*#__PURE__*/ Chain.from({
  id: 29112,
  name: 'HYCHAIN Testnet',
  nativeCurrency: { name: 'HYTOPIA', symbol: 'TOPIA', decimals: 18 },
  rpcUrls: { http: 'https://rpc.hychain.com/http' },
  blockExplorers: {
    name: 'HYCHAIN Explorer',
    url: 'https://testnet-rpc.hychain.com/http',
  },
  testnet: true,
})
