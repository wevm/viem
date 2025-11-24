import { defineChain } from '../../utils/chain/defineChain.js'

export const katana = /*#__PURE__*/ defineChain({
  id: 747474,
  name: 'Katana',
  network: 'katana',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.katana.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'katana explorer',
      url: 'https://katanascan.com',
    },
  },
  testnet: false,
})
