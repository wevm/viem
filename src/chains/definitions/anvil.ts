import { defineChain } from '../../utils/chain/defineChain.js'

export const anvil = /*#__PURE__*/ defineChain({
  id: 31_337,
  name: 'Anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
      webSocket: ['ws://127.0.0.1:8545'],
    },
  },
})
