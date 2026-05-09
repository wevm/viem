import { defineChain } from '../../utils/chain/defineChain.js'

export const eon = /*#__PURE__*/ defineChain({
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
