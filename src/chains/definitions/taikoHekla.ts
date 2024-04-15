import { defineChain } from '../../utils/chain/defineChain.js'

export const taikoHekla = /*#__PURE__*/ defineChain({
  id: 167009,
  name: 'Taiko Hekla (Alpha-7 Testnet)',
  network: 'tko-hekla',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hekla.taiko.xyz'],
    },
    public: {
      http: ['https://rpc.hekla.taiko.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'taikoscan',
      url: 'https://hekla.taikoscan.network',
    },
  },
  testnet: true,
})
