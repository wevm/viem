import { defineChain } from '../../utils/chain/defineChain.js'

export const filecoinHyperspace = /*#__PURE__*/ defineChain({
  id: 314_1,
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
