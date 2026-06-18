import * as Chain from '../../core/Chain.js'

export const xaiTestnet = /*#__PURE__*/ Chain.from({
  id: 37714555429,
  name: 'Xai Testnet',
  nativeCurrency: { name: 'sXai', symbol: 'sXAI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet-v2.xai-chain.net/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://testnet-explorer-v2.xai-chain.net',
    },
  },
  testnet: true,
})
