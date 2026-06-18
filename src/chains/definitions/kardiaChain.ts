import * as Chain from '../../core/Chain.js'

export const kardiaChain = /*#__PURE__*/ Chain.from({
  id: 24,
  name: 'KardiaChain Mainnet',
  nativeCurrency: { name: 'KAI', symbol: 'KAI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.kardiachain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'KardiaChain Explorer',
      url: 'https://explorer.kardiachain.io',
    },
  },
  testnet: false,
})
