import * as Chain from '../../core/Chain.js'

export const edgelessTestnet = /*#__PURE__*/ Chain.from({
  id: 202,
  name: 'Edgeless Testnet',
  nativeCurrency: {
    name: 'Edgeless Wrapped ETH',
    symbol: 'EwETH',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://edgeless-testnet.rpc.caldera.xyz/http',
    ws: 'wss://edgeless-testnet.rpc.caldera.xyz/ws',
  },
  blockExplorers: {
    name: 'Edgeless Testnet Explorer',
    url: 'https://testnet.explorer.edgeless.network',
  },
  testnet: true,
})
