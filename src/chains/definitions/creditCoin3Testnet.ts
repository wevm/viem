import * as Chain from '../../core/Chain.js'

export const creditCoin3Testnet = /*#__PURE__*/ Chain.define({
  id: 102031n,
  name: 'Creditcoin Testnet',
  nativeCurrency: { name: 'Creditcoin Testnet', symbol: 'tCTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.cc3-testnet.creditcoin.network'],
      webSocket: ['wss://rpc.cc3-testnet.creditcoin.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://creditcoin-testnet.blockscout.com',
      apiUrl: 'https://creditcoin-testnet.blockscout.com/api',
    },
  },
  testnet: true,
})
