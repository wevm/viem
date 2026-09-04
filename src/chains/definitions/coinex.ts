import * as Chain from '../../core/Chain.js'

export const coinex = /*#__PURE__*/ Chain.from({
  id: 52,
  name: 'CoinEx Mainnet',
  nativeCurrency: { name: 'cet', symbol: 'cet', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.coinex.net',
  },
  blockExplorers: {
    name: 'CoinEx Explorer',
    url: 'https://www.coinex.net',
  },
  testnet: false,
})
