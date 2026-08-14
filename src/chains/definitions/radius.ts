import { defineChain } from '../../utils/chain/defineChain.js'

export const radius = /*#__PURE__*/ defineChain({
  id: 723_487,
  name: 'Radius Network',
  nativeCurrency: { name: 'Radius USD', symbol: 'RUSD', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.radiustech.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Radius Network Explorer',
      url: 'https://network.radiustech.xyz',
    },
  },
  testnet: false,
})
