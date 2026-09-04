import * as Chain from '../../core/Chain.js'

export const coinbit = /*#__PURE__*/ Chain.from({
  id: 112,
  name: 'Coinbit Mainnet',
  nativeCurrency: { name: 'GIDR', symbol: 'GIDR', decimals: 18 },
  rpcUrls: {
    http: 'https://coinbit-rpc-mainnet.chain.sbcrypto.app',
  },
  blockExplorers: {
    name: 'Coinbit Explorer',
    url: 'https://coinbit-explorer.chain.sbcrypto.app',
  },
  testnet: false,
})
