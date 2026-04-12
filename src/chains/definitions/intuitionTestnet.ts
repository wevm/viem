import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 8453

export const intuitionTestnet = /*#__PURE__*/ defineChain({
  id: 13579,
  name: 'Intuition Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tTRUST',
    symbol: 'tTRUST',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.rpc.intuition.systems'],
      webSocket: ['wss://testnet.rpc.intuition.systems'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Intuition Testnet Explorer',
      url: 'https://testnet.explorer.intuition.systems',
    },
  },
  testnet: true,
  sourceId,
})
