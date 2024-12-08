import { defineChain } from '../../utils/chain/defineChain.js'

export const sonic = /*#__PURE__*/ defineChain({
  id: 146,
  name: 'Sonic',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.soniclabs.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Sonic Explorer',
      url: 'https://explorer.soniclabs.com',
    },
  },
  testnet: false,
})
