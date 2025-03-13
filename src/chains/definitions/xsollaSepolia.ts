import { defineChain } from '../../utils/chain/defineChain.js'

export const xsollaSepolia = /*#__PURE__*/ defineChain({
  id: 555777,
  name: 'Xsolla Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://zkrpc-sepolia.xsollazk.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Xsolla Sepolia Block Explorer',
      url: 'https://x.la/explorer',
    },
  },
  testnet: true,
})
