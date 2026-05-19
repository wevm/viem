import * as Chain from '../../core/Chain.js'

export const creditCoin3Mainnet = /*#__PURE__*/ Chain.define({
  id: 102030n,
  name: 'Creditcoin',
  nativeCurrency: { name: 'Creditcoin', symbol: 'CTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet3.creditcoin.network'],
      webSocket: ['wss://mainnet3.creditcoin.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://creditcoin.blockscout.com',
      apiUrl: 'https://creditcoin.blockscout.com/api',
    },
  },
  testnet: false,
})
