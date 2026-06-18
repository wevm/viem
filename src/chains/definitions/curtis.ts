import * as Chain from '../../core/Chain.js'

export const curtis = /*#__PURE__*/ Chain.from({
  id: 33_111,
  name: 'Curtis',
  nativeCurrency: { name: 'ApeCoin', symbol: 'APE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.curtis.apechain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Curtis Explorer',
      url: 'https://explorer.curtis.apechain.com',
    },
  },
  testnet: true,
})
