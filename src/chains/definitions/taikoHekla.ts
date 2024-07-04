import { defineChain } from '../../utils/chain/defineChain.js'

export const taikoHekla = /*#__PURE__*/ defineChain({
  id: 167_009,
  name: 'Taiko Hekla L2',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hekla.taiko.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Taikoscan',
      url: 'https://hekla.taikoscan.network',
    },
  },
  testnet: true,
})
