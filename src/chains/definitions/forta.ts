import * as Chain from '../../core/Chain.js'

export const forta = /*#__PURE__*/ Chain.define({
  id: 80_931n,
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
