import * as Chain from '../../core/Chain.js'

export const creditCoin3Devnet = /*#__PURE__*/ Chain.define({
  id: 102032n,
  name: 'Creditcoin Devnet',
  nativeCurrency: { name: 'Devnet CTC', symbol: 'devCTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.cc3-devnet.creditcoin.network'],
      webSocket: ['wss://rpc.cc3-devnet.creditcoin.network/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://creditcoin-devnet.blockscout.com',
      apiUrl: 'https://creditcoin3-dev.subscan.io',
    },
  },
  testnet: true,
})
