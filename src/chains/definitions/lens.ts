import { defineChain } from '../../utils/chain/defineChain.js'

export const lens = /*#__PURE__*/ defineChain({
  id: 232,
  name: 'Lens',
  nativeCurrency: { name: 'GHO', symbol: 'GHO', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.lens.dev'],
      webSocket: ['wss://rpc.lens.dev/ws'],
    },
  },
  testnet: false,
})
