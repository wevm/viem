import { defineChain } from '../../utils/chain/defineChain.js'

export const movementDevnet = /*#__PURE__*/ defineChain({
  id: 30730,
  name: 'Movement Devnet',
  nativeCurrency: { name: 'Move', symbol: 'MOVE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mevm.devnet.m1.movementlabs.xyz'],
    },
  },
})
