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
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 59757,
    },
  },
  testnet: true,
})
