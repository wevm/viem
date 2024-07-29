import { defineChain } from '../../utils/chain/defineChain.js'

export const movementImola = /*#__PURE__*/ defineChain({
  id: 30732,
  name: 'Movement Imola Devnet',
  nativeCurrency: { name: 'Move', symbol: 'MOVE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mevm.devnet.imola.movementlabs.xyz/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Movement Imola Explorer',
      url: 'https://explorer.devnet.imola.movementlabs.xyz/',
    },
  },
  testnet: true,
})
