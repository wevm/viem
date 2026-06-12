import { defineChain } from '../../utils/chain/defineChain.js'

export const alienxHalTestnet = /*#__PURE__*/ defineChain({
  id: 10241025,
  name: 'ALIENX Hal Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://hal-rpc.alienxchain.io/http'] },
  },
  blockExplorers: {
    default: {
      name: 'AlienX Explorer',
      url: 'https://hal-explorer.alienxchain.io',
    },
  },
  testnet: true,
})
