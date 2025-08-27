import { defineChain } from '../../utils/chain/defineChain.js'

export const creditCoin3UscTestnet = /*#__PURE__*/ defineChain({
  id: 102033,
  name: 'Creditcoin3 USC Testnet',
  nativeCurrency: { name: 'Creditcoin3 USC Testnet', symbol: 'CTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.ccnext-testnet.creditcoin.network'],
      webSocket: ['wss://rpc.ccnext-testnet.creditcoin.network/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.ccnext-testnet.creditcoin.network',
    },
  },
  testnet: true,
})
