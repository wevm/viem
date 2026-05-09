import { defineChain } from '../../utils/chain/defineChain.js'

export const mint = /*#__PURE__*/ defineChain({
  id: 185,
  name: 'Mint Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.mintchain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mintchain explorer',
      url: 'https://explorer.mintchain.io',
    },
  },
  testnet: false,
})
