import { defineChain } from '../../utils/chain/defineChain.js'

export const glideL2Protocol = /*#__PURE__*/ defineChain({
  id: 253,
  name: 'Glide L2 Protocol XP',
  nativeCurrency: { name: 'GLXP', symbol: 'GLXP', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-api.glideprotocol.xyz/l2-rpc'],
      webSocket: ['wss://rpc-api.glideprotocol.xyz/l2-rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Glide Protocol Explore',
      url: 'https://blockchain-explorer.glideprotocol.xyz',
    },
  },
  testnet: false,
})
