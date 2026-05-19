import * as Chain from '../../core/Chain.js'

export const edgelessTestnet = /*#__PURE__*/ Chain.define({
  id: 202n,
  name: 'Edgeless Testnet',
  nativeCurrency: {
    name: 'Edgeless Wrapped ETH',
    symbol: 'EwETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://edgeless-testnet.rpc.caldera.xyz/http'],
      webSocket: ['wss://edgeless-testnet.rpc.caldera.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Edgeless Testnet Explorer',
      url: 'https://testnet.explorer.edgeless.network',
    },
  },
  testnet: true,
})
