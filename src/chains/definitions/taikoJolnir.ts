import { defineChain } from '../../utils/chain/defineChain.js'

export const taikoJolnir = /*#__PURE__*/ defineChain({
  id: 167007,
  name: 'Taiko Jolnir (Alpha-5 Testnet)',
  network: 'tko-jolnir',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.jolnir.taiko.xyz'],
    },
    public: {
      http: ['https://rpc.jolnir.taiko.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer.jolnir.taiko.xyz',
    },
  },
})
