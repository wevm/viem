import { defineChain } from '../../utils/chain/defineChain.js'

export const coinbit = /*#__PURE__*/ defineChain({
  id: 112,
  name: 'Coinbit Mainnet',
  nativeCurrency: { name: 'GIDR', symbol: 'GIDR', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://coinbit-rpc-mainnet.chain.sbcrypto.app'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Coinbit Explorer',
      url: 'https://coinbit-explorer.chain.sbcrypto.app',
    },
  },
  testnet: false,
})
