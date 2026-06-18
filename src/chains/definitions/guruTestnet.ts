import * as Chain from '../../core/Chain.js'

export const guruTestnet = /*#__PURE__*/ Chain.from({
  id: 261,
  name: 'Guru Network Testnet',
  nativeCurrency: {
    name: 'tGURU Token',
    symbol: 'tGURU',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc-test.gurunetwork.ai',
        'https://rpc.gurunetwork.ai/archive/261',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Guruscan',
      url: 'https://sepolia.gurunetwork.ai',
    },
  },
  testnet: true,
})
