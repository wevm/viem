import * as Chain from '../../core/Chain.js'

export const loop = /*#__PURE__*/ Chain.define({
  id: 15551n,
  name: 'LoopNetwork Mainnet',
  nativeCurrency: {
    name: 'LOOP',
    symbol: 'LOOP',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://api.mainnetloop.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LoopNetwork Blockchain Explorer',
      url: 'https://explorer.mainnetloop.com/',
    },
  },
  testnet: false,
})
