import * as Chain from '../../core/Chain.js'

export const filecoinHyperspace = /*#__PURE__*/ Chain.define({
  id: 314_1n,
  name: 'Filecoin Hyperspace',
  nativeCurrency: {
    decimals: 18,
    name: 'testnet filecoin',
    symbol: 'tFIL',
  },
  rpcUrls: {
    default: { http: ['https://api.hyperspace.node.glif.io/rpc/v1'] },
  },
  blockExplorers: {
    default: {
      name: 'Filfox',
      url: 'https://hyperspace.filfox.info/en',
    },
  },
  testnet: true,
})
