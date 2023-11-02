import { defineChain } from '../../utils/chain/defineChain.js'

export const taikoJolnir = /*#__PURE__*/ defineChain({
  id: 167007,
  name: 'Taiko Jolnir L2',
  network: 'tko-jolnir',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://jolnir.taiko.xyz'],
    },
    public: {
      http: ['https://jolnir.taiko.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer.jolnir.taiko.xyz',
    },
  },
})
