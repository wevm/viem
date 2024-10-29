import { defineChain } from '../../utils/chain/defineChain.js'

export const glideL1Protocol = /*#__PURE__*/ defineChain({
  id: 251,
  name: 'Glide L1 Protocol XP',
  nativeCurrency: { name: 'GLXP', symbol: 'GLXP', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-api.glideprotocol.xyz/l1-rpc'],
      webSocket: ['wss://rpc-api.glideprotocol.xyz/l1-rpc'],
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
