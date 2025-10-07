import { defineChain } from '../../utils/chain/defineChain.js'

export const taikoHoodi = /*#__PURE__*/ defineChain({
  id: 167_012,
  name: 'Taiko Hoodi L2',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hoodi.taiko.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Taikoscan',
      url: 'https://hoodi.taikoscan.io',
    },
  },
  testnet: true,
})
