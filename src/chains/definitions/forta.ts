import { defineChain } from '../../utils/chain/defineChain.js'

export const forta = /*#__PURE__*/ defineChain({
  id: 80_931,
  name: 'Forta Chain',
  nativeCurrency: {
    symbol: 'FORT',
    name: 'FORT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-forta-chain-8gj1qndmfc.t.conduit.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Forta Explorer',
      url: 'https://explorer.forta.org',
    },
  },
})
