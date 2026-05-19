import * as Chain from '../../core/Chain.js'

export const edgeless = /*#__PURE__*/ Chain.define({
  id: 2_026n,
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
