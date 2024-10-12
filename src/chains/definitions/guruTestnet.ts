import { defineChain } from '../../utils/chain/defineChain.js'

export const guruTestnet = /*#__PURE__*/ defineChain({
  id: 261,
  name: 'Guru Network Testnet',
  nativeCurrency: {
    name: 'testGURU',
    symbol: 'tGURU',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.gurunetwork.ai/archive/261'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Guruscan',
      url: 'https://scan.gurunetwork.ai',
    },
  },
  testnet: true,
})
