import { defineChain } from '../../utils/chain/defineChain.js'

export const edgelessTestnet = /*#__PURE__*/ defineChain({
  id: 202,
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
})
