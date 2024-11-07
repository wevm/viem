import { defineChain } from '../../utils/chain/defineChain.js'

export const mekong = /*#__PURE__*/ defineChain({
  id: 7078815900,
  name: 'Mekong Pectra Devnet',
  nativeCurrency: { name: 'eth', symbol: 'eth', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.mekong.ethpandaops.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Block Explorer',
      url: 'https://explorer.mekong.ethpandaops.io',
    },
  },
  testnet: true,
})
