import * as Chain from '../../core/Chain.js'

export const eduChain = /*#__PURE__*/ Chain.from({
  id: 41923,
  name: 'EDU Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'EDU',
    symbol: 'EDU',
  },
  rpcUrls: {
    http: 'https://rpc.edu-chain.raas.gelato.cloud',
  },
  blockExplorers: {
    name: 'EDU Chain Explorer',
    url: 'https://educhain.blockscout.com/',
  },
  testnet: false,
})
