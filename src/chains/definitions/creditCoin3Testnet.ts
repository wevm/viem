import { defineChain } from '../../utils/chain/defineChain.js'

export const creditCoin3Testnet = /*#__PURE__*/ defineChain({
  id: 102031,
  name: 'Creditcoin3 Testnet',
  nativeCurrency: { name: 'Creditcoin3 Testnet', symbol: 'TCTC', decimals: 18 },
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
