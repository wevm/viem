import { defineChain } from '../../utils/chain/defineChain.js'

export const somniaTestnet = /*#__PURE__*/ defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Shannon Explorer',
      url: 'http://shannon-explorer.somnia.network/',
      apiUrl: 'https://shannon-explorer.somnia.network/api-docs',
    },
  },
  testnet: true,
})
