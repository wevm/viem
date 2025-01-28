import { defineChain } from '../../utils/chain/defineChain.js'

export const creditCoin3Mainnet = /*#__PURE__*/ defineChain({
  id: 102030,
  name: 'Creditcoin3 Mainnet',
  nativeCurrency: { name: 'Creditcoin3 Mainnet', symbol: 'CTC', decimals: 18 },
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
