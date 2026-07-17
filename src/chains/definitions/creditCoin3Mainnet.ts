import * as Chain from '../../core/Chain.js'

export const creditCoin3Mainnet = /*#__PURE__*/ Chain.from({
  id: 102030,
  name: 'Creditcoin',
  nativeCurrency: { name: 'Creditcoin', symbol: 'CTC', decimals: 18 },
  rpcUrls: {
    http: 'https://mainnet3.creditcoin.network',
    ws: 'wss://mainnet3.creditcoin.network',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://creditcoin.blockscout.com',
    apiUrl: 'https://creditcoin.blockscout.com/api',
  },
  testnet: false,
})
