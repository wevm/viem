import * as Chain from '../../core/Chain.js'

export const coinbit = /*#__PURE__*/ Chain.define({
  id: 112n,
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
