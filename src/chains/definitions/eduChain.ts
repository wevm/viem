import { defineChain } from '../../utils/chain/defineChain.js'

export const eduChain = /*#__PURE__*/ defineChain({
  id: 41923,
  name: 'EDU Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'EDU',
    symbol: 'EDU',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.edu-chain.raas.gelato.cloud'],
    },
  },
  blockExplorers: {
    default: {
      name: 'EDU Chain Explorer',
      url: 'https://educhain.blockscout.com/',
    },
  },
  testnet: false,
})
