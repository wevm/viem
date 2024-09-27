import { defineChain } from '../../utils/chain/defineChain.js'

export const hychainTestnet = /*#__PURE__*/ defineChain({
  id: 29112,
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
