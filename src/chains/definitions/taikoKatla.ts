import { defineChain } from '../../utils/chain/defineChain.js'

export const taikoKatla = /*#__PURE__*/ defineChain({
  id: 167008,
  name: 'Taiko Katla (Alpha-6 Testnet)',
  network: 'tko-katla',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.katla.taiko.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer.katla.taiko.xyz',
    },
  },
})
