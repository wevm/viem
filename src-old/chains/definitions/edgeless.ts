import { defineChain } from '../../utils/chain/defineChain.js'

export const edgeless = /*#__PURE__*/ defineChain({
  id: 2_026,
  name: 'Edgeless Network',
  nativeCurrency: {
    name: 'Edgeless Wrapped ETH',
    symbol: 'EwETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.edgeless.network/http'],
      webSocket: ['wss://rpc.edgeless.network/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Edgeless Explorer',
      url: 'https://explorer.edgeless.network',
    },
  },
})
