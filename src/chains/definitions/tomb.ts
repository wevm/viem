import * as Chain from '../../core/Chain.js'

export const tomb = /*#__PURE__*/ Chain.define({
  id: 6969n,
  name: 'Tomb Mainnet',
  nativeCurrency: { name: 'TOMB', symbol: 'TOMB', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.tombchain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tomb Explorer',
      url: 'https://tombscout.com',
    },
  },
  testnet: false,
})
