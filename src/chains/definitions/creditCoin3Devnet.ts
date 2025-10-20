import { defineChain } from '../../utils/chain/defineChain.js'

export const creditCoin3Devnet = /*#__PURE__*/ defineChain({
  id: 102032,
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
