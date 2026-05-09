import { defineChain } from '../../utils/chain/defineChain.js'

export const xrOne = /*#__PURE__*/ defineChain({
  id: 273,
  name: 'XR One',
  nativeCurrency: {
    decimals: 18,
    name: 'XR1',
    symbol: 'XR1',
  },
  rpcUrls: {
    default: {
      http: ['https://xr1.calderachain.xyz/http'],
      webSocket: ['wss://xr1.calderachain.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://xr1.calderaexplorer.xyz',
    },
  },
  testnet: false,
})
