import { defineChain } from '../../utils/chain/defineChain.js'

export const coinex = /*#__PURE__*/ defineChain({
  id: 52,
  name: 'CoinEx Mainnet',
  nativeCurrency: { name: 'cet', symbol: 'cet', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.coinex.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'CoinEx Explorer',
      url: 'https://www.coinex.net',
    },
  },
  testnet: false,
})
