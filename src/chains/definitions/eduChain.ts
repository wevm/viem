import * as Chain from '../../core/Chain.js'

export const eduChain = /*#__PURE__*/ Chain.define({
  id: 41923n,
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
