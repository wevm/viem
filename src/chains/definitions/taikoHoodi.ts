import { defineChain } from '../../utils/chain/defineChain.js'

export const taikoHoodi = /*#__PURE__*/ defineChain({
  id: 167_013,
  name: 'Taiko Hoodi',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hoodi.taiko.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://hoodi.taikoscan.io',
    },
  },
  testnet: true,
})
