import { defineChain } from '../../utils/chain/defineChain.js'

export const citrate = /*#__PURE__*/ defineChain({
  id: 40_204,
  name: 'Citrate',
  nativeCurrency: { name: 'SALT', symbol: 'SALT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.citrate.ai'],
      webSocket: ['wss://rpc.citrate.ai'],
    },
  },
  testnet: true,
})
