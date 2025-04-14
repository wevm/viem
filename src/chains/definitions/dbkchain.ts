import { defineChain } from '../../utils/chain/defineChain.js'

export const dbkchain = /*#__PURE__*/ defineChain({
  id: 20_240_603,
  name: 'DBK chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.dbkchain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DBK Chain Explorer',
      url: 'https://scan.dbkchain.io',
    },
  },
  testnet: false,
})
