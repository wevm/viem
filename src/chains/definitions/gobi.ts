import * as Chain from '../../core/Chain.js'

export const gobi = /*#__PURE__*/ Chain.define({
  id: 1_663n,
  name: 'Horizen Gobi Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Test ZEN',
    symbol: 'tZEN',
  },
  rpcUrls: {
    default: { http: ['https://gobi-testnet.horizenlabs.io/ethv1'] },
  },
  blockExplorers: {
    default: {
      name: 'Gobi Explorer',
      url: 'https://gobi-explorer.horizen.io',
    },
  },
  contracts: {},
  testnet: true,
})
