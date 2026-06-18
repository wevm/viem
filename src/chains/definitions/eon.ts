import * as Chain from '../../core/Chain.js'

export const eon = /*#__PURE__*/ Chain.from({
  id: 7_332,
  name: 'Horizen EON',
  nativeCurrency: {
    decimals: 18,
    name: 'ZEN',
    symbol: 'ZEN',
  },
  rpcUrls: {
    default: { http: ['https://eon-rpc.horizenlabs.io/ethv1'] },
  },
  blockExplorers: {
    default: {
      name: 'EON Explorer',
      url: 'https://eon-explorer.horizenlabs.io',
    },
  },
  contracts: {},
})
